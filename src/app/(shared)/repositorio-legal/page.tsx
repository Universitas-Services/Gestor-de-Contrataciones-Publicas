import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ServiceCard } from "../conocenos/ServiceCard";

const legalServices = [
  {
    imageSrc: "/repositorio-legal/1.webp",
    title: "Consideraciones Generales",
    description:
      "Para garantizar un proceso de entrega-recepción transparente, te invitamos a leer detenidamente las siguientes consideraciones",
    buttonText: "Inscríbete aquí",
    href: "https://universitas.legal/consideraciones-generales/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/repositorio-legal/2.webp",
    title: "Repositorio Legal",
    description: "Descarga la Resolución CGR N°01-000162 de fecha 27-07-2009",
    buttonText: "Descargar aquí",
    href: "/repositorio-legal/documents/CGR.Normas.Entrega.oficina(2009).pdf",
    download: "CGR.Normas.Entrega.oficina(2009).pdf",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/repositorio-legal/3.webp",
    title: "Actas de entrega en la Administración Pública",
    description:
      "Profundiza en el marco jurídico y los procedimientos clave, asegurando la transparencia y mitigación de riesgos en la administración pública.",
    buttonText: "Mas Información",
    href: "https://universitas.academy/cursos/actas-de-entrega/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/repositorio-legal/4.webp",
    title: "Verificación de las actas de entrega en la Administración Pública",
    description:
      "Tienes 120 días para formular observaciones a un acta recibida. Descubre en este análisis los puntos clave que debes verificar para un control fiscal efectivo.",
    buttonText: "Inscríbete aquí",
    href: "https://agora.universitasfundacion.com/verificacion-de-acta-de-entrega/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/repositorio-legal/5.webp",
    title: "Acta de entrega: Verificación por la Unidad de Auditoría Interna",
    description:
      "La Unidad de Auditoría Interna es el actor clave en la verificación. Conoce sus competencias, responsabilidades y el procedimiento que debe seguir para validar las actas.",
    buttonText: "Inscríbete aquí",
    href: "https://agora.universitasfundacion.com/acta-de-entrega-verificacion/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/repositorio-legal/6.webp",
    title: "Verificación acta de entrega y Control Fiscal Interno",
    description:
      "El acta de entrega es más que un requisito; es una herramienta clave del Control Interno. Descubre cómo su correcta verificación previene riesgos y fortalece la gestión.",
    buttonText: "Inscríbete aquí",
    href: "https://agora.universitasfundacion.com/verificacion-acta-de-entrega/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/repositorio-legal/7.webp",
    title: "Biblioteca Legal: Control Fiscal",
    description:
      "Accede a un compendio normativo completo, doctrina administrativa y jurisprudencia esencial para fortalecer el control fiscal en todos los niveles del sector público.",
    buttonText: "Ingrese aquí",
    href: "https://universitas.legal/control-fiscal/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/repositorio-legal/8.webp",
    title: "Biblioteca Legal: Contrataciones Públicas",
    description:
      "Accede a normativa especializada, doctrina administrativa y jurisprudencia clave para garantizar contrataciones públicas sostenibles, transparentes y ajustadas al interés general.",
    buttonText: "Ingrese aquí",
    href: "https://universitas.legal/biblioteca-contratacion-publica/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  {
    imageSrc: "/repositorio-legal/9.webp",
    title: "Biblioteca Legal: Ordenanzas Municipales",
    description:
      "Explora y descarga decretos, acuerdos y resoluciones de cientos de municipios, con acceso abierto y colaborativo para impulsar gobiernos más transparentes, eficientes y conectados con su comunidad.",
    buttonText: "Ingrese aquí",
    href: "https://universitas.legal/biblioteca-de-ordenanzas-municipales/",
    target: "_blank",
    rel: "noopener noreferrer",
  },
];

export default async function RepositorioLegalPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin_ente" || !user.enteId) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] rounded-xl bg-[#EFF2F5] p-6 md:p-10 flex flex-col">
      <div className="w-full max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-center text-[#1B456F] mb-10">Repositorio legal</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {legalServices.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
}
