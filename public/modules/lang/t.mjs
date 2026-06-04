for (const c of ['de','ru','ja','vi','pt-br','tr','ko']) {
  const m = await import('./'+c+'.mjs');
  const s = m.default.strings;
  const e = s.logEliminated.replace('{name}','Bob');
  const sh = s.logShowdown.replace('{name}','Bob').replace('{cards}','♠A ♥K').replace('{hand}','Flush');
  console.log(c, '|', e, '||', sh);
}
