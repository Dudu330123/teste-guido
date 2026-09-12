import { query } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";

export type AdminAccess = Awaited<ReturnType<typeof getAdminAccess>>;

export async function getAdminAccess() {
  const user = await getCurrentUser();
  if (!user) return null;
  let result;
  try {
    result = await query<{ role: "editor" | "reviewer" | "admin" | "superadmin" }>("select role from team_members where user_id = $1 and active = true", [user.id]);
  } catch {
    return null;
  }
  const row = result.rows[0];
  return row ? { user, role: row.role } : null;
}

/**
 * Exige o nível máximo de acesso para operações que publicam conteúdo para todos.
 * A decisão usa o UUID da sessão e o vínculo ativo no banco; o e-mail do
 * proprietário não fica gravado no código e não pode ser forjado pelo navegador.
 */
export async function getSuperadminAccess() {
  const access = await getAdminAccess();
  return access?.role === "superadmin" ? access : null;
}
