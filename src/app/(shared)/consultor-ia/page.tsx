import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ConsultorChat } from "./ConsultorChat";

export default async function ConsultorIAPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin_ente" || !user.enteId) {
    redirect("/login");
  }

  return (
    <div className="p-4">
      <ConsultorChat userName={user.name} />
    </div>
  );
}
