import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/auth";

import { UserDetailManagementCard } from "./UserDetailManagementCard";

export default async function DetalleUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <UserDetailManagementCard userId={id} adminName={user.name} adminEmail={user.email} />;
}
