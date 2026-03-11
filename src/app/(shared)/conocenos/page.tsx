import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ServiceCard } from "./ServiceCard";

const services = [
  {
    imageSrc: "/conocenos/1.webp",
    title: "Jornadas de Control Fiscal",
    description:
      "Transforma tu carrera y domina la vanguardia de la gestión pública con las Jornadas de Control Fiscal. Universitas Academy te brinda acceso exclusivo a los expertos más influyentes del sector.",
    buttonText: "Inscríbete aquí",
    href: "https://universitas.academy/cursos/jornadas-de-control-fiscal/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/conocenos/2.webp",
    title: "El Funcionario Público",
    description:
      "Domina el marco legal que rige tu carrera. Un curso esencial sobre los derechos, deberes y responsabilidades de todo servidor público, desde el ingreso hasta el retiro.",
    buttonText: "Inscríbete aquí",
    href: "https://universitas.academy/cursos/el-funcionario-publico/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/conocenos/3.webp",
    title: "Actas de entrega en la Administración Pública",
    description:
      "Este programa te equipará con las competencias esenciales para la elaboración y gestión de Actas de Entrega.",
    buttonText: "Mas Información",
    href: "https://universitas.academy/cursos/actas-de-entrega/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/conocenos/4.webp",
    title: "Cursos Virtuales",
    description:
      "Eleva tu perfil profesional con Universitas Academy, la plataforma de formación en línea que te conecta con el conocimiento de vanguardia en derecho y administración pública.",
    buttonText: "Mas Información",
    href: "https://universitas.academy/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/conocenos/5.webp",
    title: "Jornadas Contrataciones Públicas",
    description:
      "Actualízate con los mayores expertos del país. Accede a las ponencias y debates de nuestras más recientes jornadas sobre los retos actuales de la contratación pública.",
    buttonText: "Inscríbete aquí",
    href: "https://universitas.academy/cursos/jornadas-contrataciones-publicas/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/conocenos/6.webp",
    title: "Ágora",
    description:
      "Ágora es un espacio diseñado para que los profesionales puedan publicar sus artículos de investigación o de opinión y noticias.",
    buttonText: "Inscríbete aquí",
    href: "https://agora.universitasfundacion.com/category/universitas-legal/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/conocenos/7.webp",
    title: "Régimen Disciplinario de los Funcionarios Públicos",
    description:
      "Conoce a fondo el procedimiento de amonestación y destitución. Un curso clave para comprender las faltas, sanciones y protegerte de riesgos disciplinarios.",
    buttonText: "Inscríbete aquí",
    href: "https://universitas.academy/cursos/regimen-disciplinario-del-funcionario-publico/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/conocenos/8.webp",
    title: "El Control en la Gestión Pública",
    description:
      "Fortalece la gestión de tu entidad. Profundiza en los sistemas de control interno, la responsabilidad administrativa y las herramientas para una administración eficiente y transparente.",
    buttonText: "Inscríbete aquí",
    href: "https://universitas.academy/cursos/control-en-la-gestion-publica/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/conocenos/9.webp",
    title: "Fundamentos de la Contratación Pública",
    description:
      "Evita errores costosos en los procesos de compra del Estado. Domina las leyes, modalidades y principios esenciales de la contratación pública en Venezuela.",
    buttonText: "Inscríbete aquí",
    href: "https://universitas.academy/cursos/fundamentos-de-la-contratacion-publica/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
];

export default async function ConocenosPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin_ente" || !user.enteId) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-xl bg-[#EFF2F5] p-6 md:p-10 flex flex-col">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-[#1B456F] mb-10">Conócenos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
}
