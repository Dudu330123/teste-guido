import { getAuthenticatedSupabaseServerClient } from "./server";

export type AdminAccess = Awaited<ReturnType<typeof getAdminAccess>>;

/** Confirma identidade e vínculo ativo com a equipe usando RLS, sem chave administrativa. */
export async function getAdminAccess() {
  const authenticated = await getAuthenticatedSupabaseServerClient();
  if (!authenticated) return null;

  const { data, error } = await authenticated.supabase
    .from("team_members")
    .select("role, active")
    .eq("user_id", authenticated.user.id)
    .eq("active", true)
    .maybeSingle();
  if (error || !data) return null;
  return { ...authenticated, role: data.role as "editor" | "reviewer" | "admin" | "superadmin" };
}
