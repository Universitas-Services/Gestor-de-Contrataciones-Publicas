const fs = require("fs");
const path =
  "C:/Users/unive/OneDrive/Desktop/frank/front/contratacion_publica/Gestor-de-Contrataciones-Publicas/src/components/features-components/EstructuraOrganizativa/ListadoUsuarios.tsx";

let content = fs.readFileSync(path, "utf8");

content = content.replace(/text-var\(--color-boton-2\)/g, "text-[var(--color-boton-2)]");
content = content.replace(/bg-var\(--color-boton-2\)/g, "bg-[var(--color-boton-2)]");
content = content.replace(/border-var\(--color-boton-2\)/g, "border-[var(--color-boton-2)]");

fs.writeFileSync(path, content);
console.log("Fixed classes!");
