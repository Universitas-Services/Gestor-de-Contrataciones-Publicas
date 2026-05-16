"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LegalCard, type LegalCardData } from "./LegalCard";

// ── Data ───────────────────────────────────────────────────────────────────────
const BASE_CARDS: LegalCardData[] = [
  {
    title:
      "Ley Constitucional contra la Guerra Económica para la Racionalidad y Uniformidad en la Adquisición de Bienes, Servicios y Obras Públicas",
    label: "Ley Constitucional",
    description:
      "Establece normas para unificar, racionalizar y transparentar los procesos de contratación pública en todos los niveles de la administración.",
    publishDate: "11 de enero de 2018",
    gacetaNumber: "GO N° 41.318",
    gacetaLink:
      "https://drive.google.com/file/d/12KmE0VkMbR4hpqE4FJ65n-XsTKWoOkKj/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1R_4sIiisjtGSQ9IJIuaM8t60XT5VkmpR/view?usp=drive_link",
  },
  {
    title: "Ley de Contrataciones Públicas",
    label: "Ley Orgánica",
    description:
      "Regula la actividad del estado para la adquisición de bienes, prestación de servicios y ejecución de obras con la finalidad de preservar el patrimonio público.",
    publishDate: "19 de noviembre de 2014",
    gacetaNumber: "GOE N° 6.154",
    gacetaLink:
      "https://drive.google.com/file/d/1ywIaPKQbxCRE4ockCKsWIvOVaAtcGLyN/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1jEkx5mn1EL3fM_bsrXjOzkvJNv9EIi8q/view?usp=drive_link",
  },
  {
    title: "Ley de Infogobierno",
    label: "Ley Ordinaria",
    description:
      "Establece los principios y lineamientos que rigen el uso de las tecnologías de información en el Poder Público y el Poder Popular para mejorar la gestión pública y los servicios.",
    publishDate: "17 de octubre de 2013",
    gacetaNumber: "GO N° 40.274",
    gacetaLink:
      "https://drive.google.com/file/d/1fzH4f9otU02BO7r99yuvcuaNAt-_GKOf/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1ORW6Lq0Y4vV02iNCJRWGsWG00E2ano9a/view?usp=drive_link",
  },
  {
    title: "Ley Orgánica sobre Promoción de la Inversión Privada bajo el Régimen de Concesiones",
    label: "Ley Orgánica",
    description:
      "Establece un marco jurídico para promover la inversión privada en la construcción de infraestructura y la gestión de servicios públicos mediante contratos de concesión.",
    publishDate: "25 de octubre de 1999",
    gacetaNumber: "GOE N° 5.394",
    gacetaLink:
      "https://drive.google.com/file/d/1fYXZbsfvjlANfdnohZ5UgJ5_CFwVcg5w/view?usp=sharing",
    downloadLink:
      "https://drive.google.com/file/d/1KW0Ey4mJ0lPwVAhpyHgdtViQKlSsyrK3/view?usp=drive_link",
  },
  {
    title: "Ley Orgánica de la Administración Financiera del Sector Público",
    label: "Ley Orgánica",
    description:
      "Regula la administración financiera del sector público estableciendo las normas y principios de transparencia, responsabilidad y equilibrio fiscal que rigen la captación de los recursos públicos.",
    publishDate: "30 de diciembre de 2015",
    gacetaNumber: "GOE N° 6.210",
    gacetaLink:
      "https://drive.google.com/file/d/1vb9i9BrtYVMFh4hjyiZqgJKkgroi1AGy/view?usp=sharing",
    downloadLink:
      "https://drive.google.com/file/d/1vb9i9BrtYVMFh4hjyiZqgJKkgroi1AGy/view?usp=sharing",
  },
  {
    title: "Ley de Simplificación de Trámites Administrativos",
    label: "Ley Ordinaria",
    description:
      "Racionaliza y optimiza las diligencias que realizan las personas ante la administración pública, imponiendo la supresión de requisitos innecesarios.",
    publishDate: "26 de noviembre de 2014",
    gacetaNumber: "GO N° 40.549",
    gacetaLink:
      "https://drive.google.com/file/d/1Z58fX_2S9pu-sJp8MoWL3X4HVVOgVRt8/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1Z58fX_2S9pu-sJp8MoWL3X4HVVOgVRt8/view?usp=drive_link",
  },
  {
    title: "Normas de Control Interno aplicables a Contrataciones Públicas",
    label: "Norma General",
    description:
      "Garantiza el funcionamiento, mantenimiento y mejoramiento continuo del sistema de control interno respecto a las contrataciones públicas celebradas por los órganos y entes de la administración pública.",
    publishDate: "27 de junio de 2025",
    gacetaNumber: "GO N° 43.158",
    gacetaLink:
      "https://drive.google.com/file/d/1EgcdaFsh-KbNEbuY96kl6hj1qGfWaNlJ/view?usp=sharing",
    downloadLink:
      "https://drive.google.com/file/d/1cpb5Z5Tp0TWXmdYRjZDPoZFmrJ2eye2g/view?usp=drive_link",
  },
  {
    title: "Ley especial de Asociaciones Cooperativas",
    label: "Ley Especial",
    description:
      "Regula la constitución, organización y funcionamiento de las cooperativas como empresas de propiedad colectiva estableciendo mecanismos para su fomento, integración y control.",
    publishDate: "18 de septiembre de 2001",
    gacetaNumber: "GO N° 37.285",
    gacetaLink:
      "https://drive.google.com/file/d/1WgNHKB_ty4XQYiFgvKi---HGiITIqsJa/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1dSF6Y0gg5jdmNhbmWMIpcNbQg3oIAfKl/view?usp=sharing",
  },
  {
    title:
      "Ley Orgánica de la Contraloría General de la República y del Sistema Nacional de Control Fiscal",
    label: "Ley Orgánica",
    description:
      "Regula el sistema nacional de control fiscal estableciendo normas para la vigilancia, inspección y fiscalización de los ingresos, gastos y bienes públicos.",
    publishDate: "23 de diciembre de 2010",
    gacetaNumber: "GOE N° 6.013",
    gacetaLink:
      "https://drive.google.com/file/d/1tcHQgmvdT_pAsGUtCcUcFyxHAjeD2nYo/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1QsJwSMnUouPCYLtRXPmROhDyn10yly4_/view?usp=sharing",
  },
  {
    title:
      "Ley que Promueve y Regula las Nuevas Formas Asociativas Conjuntas entre el Estado, la Iniciativa Comunitaria y Privada para el Desarrollo de la Economía Nacional",
    label: "Ley Ordinaria",
    description:
      "Normaliza las nuevas formas asociativas de transición al socialismo, permitiendo que las personas naturales o jurídicas se asocien con el Estado.",
    publishDate: "15 de junio de 2012",
    gacetaNumber: "GO N° 39.945",
    gacetaLink:
      "https://drive.google.com/file/d/1Cc8BW2Rq9WPT993spAvrMkbOFkC1l4j4/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1Cc8BW2Rq9WPT993spAvrMkbOFkC1l4j4/view?usp=drive_link",
  },
  {
    title: "Ley Orgánica de Procedimientos Administrativos",
    label: "Ley Orgánica",
    description:
      "Regula la actividad de la administración pública, estableciendo las garantías procesales para los ciudadanos, lapsos de respuesta, formalidades y los recursos impugnatorios.",
    publishDate: "01 de julio de 1981",
    gacetaNumber: "GOE N° 2.818",
    gacetaLink:
      "https://drive.google.com/file/d/1MxLhaOxChapqqQjazBT3HdOn3cNDiuGI/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1KEvJEZvRyAyJld-xeZydzrlPzj8AsREI/view?usp=drive_link",
  },
  {
    title: "Reglamento de la Ley de Contrataciones Públicas",
    label: "Reglamento",
    description:
      "Desarrolla las normas que regulan las materias contenidas en la legislación central en materia de contrataciones del Estado.",
    publishDate: "19 de mayo de 2009",
    gacetaNumber: "GO N° 39.181",
    gacetaLink:
      "https://drive.google.com/file/d/1MF1zKlSU2op5FFkYHHaSUdjpdVMbgyqf/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/18dZ9Ze9wcRrTkWNUB6EubqRs_9QHInAz/view?usp=drive_link",
  },
  {
    title: "Ley Orgánica sobre Bienes Públicos",
    label: "Ley Orgánica",
    description:
      "Establece las normas que regulan el ámbito, organización, atribuciones y funcionamiento del sistema de bienes públicos como parte integrante del sistema de administración financiera del Estado.",
    publishDate: "19 de noviembre de 2014",
    gacetaNumber: "GOE N° 6.155",
    gacetaLink:
      "https://drive.google.com/file/d/1TW0LpZY0kukNShs9L1NxCvRoKJbKbkkd/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1TW0LpZY0kukNShs9L1NxCvRoKJbKbkkd/view?usp=drive_link",
  },
  {
    title: "Ley Orgánica del Sistema Económico Comunal",
    label: "Ley Orgánica",
    description:
      "Desarrolla y fortalece el Poder Popular, estableciendo normas, principios y procedimientos para la creación y funcionamiento del sistema económico comunal.",
    publishDate: "21 de diciembre de 2010",
    gacetaNumber: "GOE N° 6.011",
    gacetaLink:
      "https://drive.google.com/file/d/1vGs6SjV4TiNAFqNCdkQjMb2poP-cFvN7/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/13G1a8LDQDpR5gt2eCOXnD5NsU3OJD28q/view?usp=drive_link",
  },
  {
    title:
      "Ley para la Promoción y Desarrollo de la Pequeña y Mediana Industria y Unidades de Propiedad Social",
    label: "Ley Orgánica",
    description:
      "Regula el proceso de desarrollo integral de la pequeña y mediana industria, así como de las unidades de propiedad social, a través de su promoción y financiamiento.",
    publishDate: "27 de noviembre de 2014",
    gacetaNumber: "GO N° 40.550",
    gacetaLink:
      "https://drive.google.com/file/d/1eo6sH7lM6YPhFV4ykLw5qrw_GQ1UqApj/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1eo6sH7lM6YPhFV4ykLw5qrw_GQ1UqApj/view?usp=drive_link",
  },
  {
    title:
      "Reglamento N° 1 de la Ley Orgánica de la Administración Financiera del Sector Público, sobre el Sistema Presupuestario",
    label: "Reglamento",
    description: "Desarrolla los aspectos inherentes al sistema presupuestario del Estado.",
    publishDate: "12 de agosto de 2005",
    gacetaNumber: "GOE N° 5.781",
    gacetaLink:
      "https://drive.google.com/file/d/1cSvKU6k3M3Dug2kJ5NaO1rSCLKVTFIE8/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1cSvKU6k3M3Dug2kJ5NaO1rSCLKVTFIE8/view?usp=drive_link",
  },
  {
    title:
      "Ley sobre Acceso e Intercambio Electrónico de Datos, Información y Documentación entre los Órganos y Entes del Estado",
    label: "Ley Ordinaria",
    description:
      "Define los principios para el intercambio electrónico de datos entre órganos del Estado, desarrollando sistemas interoperables que optimicen la gestión pública.",
    publishDate: "15 de junio de 2012",
    gacetaNumber: "GO N° 39.945",
    gacetaLink:
      "https://drive.google.com/file/d/1wnWDEFPIHoFK7_8MS6rCTbC218Vc7ZqO/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1v_UIPR-PqHKP4QoBV_MzzGltAnNwmLPK/view?usp=drive_link",
  },
  {
    title:
      "Reglamento N° 3 de la Ley Orgánica de la Administración Financiera del Sector Público, sobre el Sistema de Tesorería",
    label: "Reglamento",
    description:
      "Desarrolla los principios y disposiciones que establecen las normas y procesos aplicables al servicio de tesorería nacional.",
    publishDate: "10 de mayo de 2006",
    gacetaNumber: "GO N° 38.433",
    gacetaLink:
      "https://drive.google.com/file/d/1CiIre9wFNZ7K-KZsI0eHUQeER_cEtNv7/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1CiIre9wFNZ7K-KZsI0eHUQeER_cEtNv7/view?usp=drive_link",
  },
  {
    title: "Ley sobre Mensajes de Datos y Firmas Electrónicas",
    label: "Ley Ordinaria",
    description:
      "Otorga y reconoce la eficacia y valor jurídico a la firma electrónica, al mensaje de datos y a toda la información en formato electrónico.",
    publishDate: "28 de febrero de 2001",
    gacetaNumber: "GO N° 37.148",
    gacetaLink:
      "https://drive.google.com/file/d/1O2nkp_OZ7C2WmL7NjDmb9ukn37fD4W4f/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1O2nkp_OZ7C2WmL7NjDmb9ukn37fD4W4f/view?usp=drive_link",
  },
  {
    title:
      "Reglamento Parcial N° 4 de la Ley Orgánica de la Administración Financiera del Sector Público, sobre el Sistema de Contabilidad Pública",
    label: "Reglamento",
    description:
      "Garantiza un registro único y sistemático de las transacciones para facilitar el ejercicio del control y la auditoría sobre la gestión pública.",
    publishDate: "12 de diciembre de 2005",
    gacetaNumber: "GO N° 38.333",
    gacetaLink:
      "https://drive.google.com/file/d/1szhuOsGOaB8TPwj3VPl5ZorwvszbCh1e/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1szhuOsGOaB8TPwj3VPl5ZorwvszbCh1e/view?usp=drive_link",
  },
  {
    title:
      "Reglamento de la Ley Orgánica de la Contraloría General de la República y del Sistema Nacional de Control Fiscal",
    label: "Reglamento",
    description:
      "Desarrolla los principios para regular el control, vigilancia y fiscalización de los ingresos, gastos y bienes públicos, así como el sistema nacional de control fiscal y la participación ciudadana.",
    publishDate: "12 de agosto de 2009",
    gacetaNumber: "GO N° 39.240",
    gacetaLink:
      "https://drive.google.com/file/d/1intdbAlbuQN72GY2apiHTU6sn1MFkmJ0/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1intdbAlbuQN72GY2apiHTU6sn1MFkmJ0/view?usp=drive_link",
  },
  {
    title:
      "Resolución mediante la cual se regula el Registro nacional de Entidades de Trabajo (RNET)",
    label: "Resolución",
    description:
      "Regula el registro nacional de entidades de trabajo y la solvencia laboral, estableciendo un sistema automatizado de carácter obligatorio para todas las entidades de trabajo.",
    publishDate: "07 de mayo de 2015",
    gacetaNumber: "GO N° 40.655",
    gacetaLink:
      "https://drive.google.com/file/d/1zKHshHaNeBZ8GDuEjFQgRxw2fdDGzoEN/view?usp=drive_link",
    downloadLink:
      "https://drive.google.com/file/d/1zKHshHaNeBZ8GDuEjFQgRxw2fdDGzoEN/view?usp=drive_link",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export function LegalCarousel() {
  return (
    <div className="relative px-12 pb-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
          watchDrag: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {BASE_CARDS.map((card, idx) => (
            <CarouselItem key={idx} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <div className="h-full transition-transform duration-300 hover:-translate-y-1 p-1">
                <LegalCard data={card} className="h-full flex flex-col" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-6 md:-left-12 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 text-gray-400 hover:text-[var(--color-navy)] hover:border-[var(--color-navy)]/40 hover:bg-white" />
        <CarouselNext className="absolute -right-6 md:-right-12 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 text-gray-400 hover:text-[var(--color-navy)] hover:border-[var(--color-navy)]/40 hover:bg-white" />
      </Carousel>
    </div>
  );
}
