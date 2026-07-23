import { redirect } from "next/navigation";
import { ROLE_ROUTES } from "@/lib/constants/routes";

export default function DiasNoLaborablesRedirectPage() {
  redirect(ROLE_ROUTES.admin_ente.calendarioEnte);
}
