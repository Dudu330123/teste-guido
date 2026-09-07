import { redirect } from "next/navigation";

/** Mantém links antigos funcionando sem preservar uma segunda tela de upload. */
export default function SendGuideImagePage() {
  redirect("/admin/guias/preview#prints-dos-guias");
}
