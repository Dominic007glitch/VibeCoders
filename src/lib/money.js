export const roundCents=n=>Math.round((Number(n)+Number.EPSILON)*100);
export const fromCents=n=>Number(n||0)/100;
export const brl=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n||0));
export function calculateSplit(receivedCents,paidCostsCents,reserveCents,ratio=50){
 const available=Math.max(0,receivedCents-paidCostsCents-reserveCents);
 const first=Math.floor(available*ratio/100);
 return {available,first,second:available-first};
}
