export const arrayCompare = (a : string[], b : string[]) => {
  let ainb = true, bina = true;
  a.forEach(s => {
    if (b.indexOf(s) === -1) ainb = false;
  });
  b.forEach(s => {
    if (a.indexOf(s) === -1) bina = false;
  });
  return ainb && bina;
}