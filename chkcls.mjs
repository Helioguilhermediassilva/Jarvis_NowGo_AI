import { listarOportunidadesDeAtivosCrmIa, listarTopDealRooms } from "./server/brainQueries.ts";
const todos = await listarOportunidadesDeAtivosCrmIa();
const byClass = {};
for (const o of todos) {
  const c = o.classificacaoSun ?? "—";
  byClass[c] = (byClass[c] ?? 0) + 1;
}
console.log("TOTAL:", todos.length);
console.log("POR CLASSE:", byClass);
const ativos = todos.filter(o => o.classificacaoSun !== "Descartada");
console.log("NÃO-DESCARTADAS (ativas no funil):", ativos.length);
const top = await listarTopDealRooms(5);
console.log("\nTOP 5 DEAL ROOMS:");
top.forEach((o,i)=>console.log(`${i+1}. ${o.nome} | ${o.classificacaoSun} | score ${o.score} | R$ ${o.valorEstimado}`));
