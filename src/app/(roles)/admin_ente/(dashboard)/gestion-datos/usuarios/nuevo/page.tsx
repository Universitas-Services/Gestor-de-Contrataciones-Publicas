import React from "react";
import { getCurrentUser } from "@/lib/auth/auth";
import { CreateUserForm } from "@/components/forms/admin_ente/CreateUserForm";
import { redirect } from "next/navigation";

export default async function NuevoUsuarioPage() {
  const session = await getCurrentUser();

  if (!session || !session.enteId) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      <CreateUserForm enteId={session.enteId} />
    </div>
  );
}
