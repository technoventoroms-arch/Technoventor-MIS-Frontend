export const getDateString = (year: number, month: number, day: number) =>
  new Date(year, month, day).toDateString();
