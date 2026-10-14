const fs = require("fs");
const p = "src/components/features-components/GestionExpedientes/fase2/Fase2Panel.tsx";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
let n = 0;
for (let i = 0; i < lines.length; i++) {
  if (/^\s+<\s*$/.test(lines[i])) {
    lines[i] = lines[i].replace("<", '{"<"}');
    n++;
  } else if (/^\s+>\s*$/.test(lines[i])) {
    lines[i] = lines[i].replace(">", '{">"}');
    n++;
  }
}
fs.writeFileSync(p, lines.join("\n"));
console.log("fixed", n);
