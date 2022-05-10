export const parseDate = (raw: string): Date => {
  const date = new Date();
  if (!raw) return undefined;


  const rawParts = raw.trim().split(" ");

  const dateParts = rawParts[0].split("-").map(v => parseInt(v));
  const timeParts = rawParts[1].split(":").map(v => parseInt(v));

  date.setFullYear(dateParts[0], dateParts[1] - 1, dateParts[2]);
  date.setHours(timeParts[0], timeParts[1], timeParts[2], 0);

  return date;
}

export const getStartOfDay = (date = new Date()) => {
  date = new Date(date.getTime());
  date.setHours(0,0,0,0);
  return date;
}

export const getEndOfDay = (date = new Date()) => {
  date = new Date(date.getTime());
  date.setHours(23,59,59,0);
  return date;
}

export const getDayRage = (date = new Date()) : [Date , Date] => {
  return [getStartOfDay(date), getEndOfDay(date)];
}

export const convertToDay = (date : Date) => {
  if (!date) return undefined;
  const dd = new Date(date.getTime());
  dd.setHours(0, 0, 0, 0,);
  return dd;
}
