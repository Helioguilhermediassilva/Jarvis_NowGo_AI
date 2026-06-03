import { listarAtivosCrmIa } from "./server/brainQueries.ts";
const ativos = await listarAtivosCrmIa();
const dr = ativos.filter(a => (a.company||"").toLowerCase().includes("roberto"));
dr.forEach(a => console.log(JSON.stringify({id:a.id, company:a.company, status:a.status, priority:a.priority, valor:a.estimatedValueBrl, expectedClose:a.expectedClose, type:a.type}, null, 2)));
console.log("encontrados:", dr.length);
