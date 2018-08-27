const TODAY = new Date();
export const gWeekDay = date => date.getDay();
export const gDay = date => date.getDate();
export const gMonth = date => date.getMonth();
export const gYear = date => date.getFullYear();
function splitDate(date) {
  return {
    dayOfTheWeek: gWeekDay(date),
    day: gDay(date),
    monthNumber: gMonth(date),
    fullYear: gYear(date),
  };
}

function computeMonthFromDays(NUMBER_OF_DAYS) {
  const date = new Date(gYear(TODAY), gMonth(TODAY), gDay(TODAY) + NUMBER_OF_DAYS);
  const NUMBER_OF_MONTHS = (gYear(date) - gYear(TODAY)) * 12 + gMonth(date) - gMonth(TODAY);
  return NUMBER_OF_MONTHS;
}
function computeDaysFromMonths(NUMBER_OF_MONTH) {
  const NUMBER_OF_DAYS =
    (Date.UTC(gYear(TODAY), gMonth(TODAY) + NUMBER_OF_MONTH) -
      Date.UTC(gYear(TODAY), gMonth(TODAY))) /
    (1000 * 60 * 60 * 24);
  return NUMBER_OF_DAYS;
}

function createDaysArray(NUMBER_OF_DAYS, fullMonths) {
  let currentConstructorDate = new Date();
  const days = [];

  for (let i = 0; i < NUMBER_OF_DAYS; i++) {
    let date = splitDate(currentConstructorDate);
    days.push(date);
    currentConstructorDate = new Date(date.fullYear, date.monthNumber, date.day + 1);
  }

  if (fullMonths) {
    while (gMonth(currentConstructorDate) === days[days.length - 1].monthNumber) {
      let date = splitDate(currentConstructorDate);
      days.push(date);
      currentConstructorDate = new Date(date.fullYear, date.monthNumber, date.day + 1);
    }
  }
  return days;
}

function createMonthsArray(NUMBER_OF_MONTHS) {
  let currentConstructorMonth = new Date();
  const months = [];

  for (let i = 0; i <= NUMBER_OF_MONTHS; i++) {
    let date = {
      day: i === 0 ? gDay(currentConstructorMonth) : 1,
      monthNumber: gMonth(currentConstructorMonth),
      fullYear: gYear(currentConstructorMonth),
    };
    months.push({
      monthNumber: date.monthNumber,
      fullYear: date.fullYear,
    });
    currentConstructorMonth = new Date(date.fullYear, date.monthNumber + 1, date.day);
  }
  return months;
}

function createPrependArray(PREPEND_MONTHS) {
  const prepended = [{fullYear: gYear(TODAY), monthNumber: gMonth(TODAY)}];
  for (let i = 0; i < PREPEND_MONTHS; i++) {
    let year = prepended[0].fullYear;
    let index = prepended[0].monthNumber - 1;
    if (index === -1) {
      index = 11;
      year--;
    }
    prepended.unshift({monthNumber: index, fullYear: year, past: true});
  }
  prepended.pop();
  return prepended;
}

function buildYear(year) {
  let currentConstructorDate = new Date(Date.UTC(year, 0, 1));
  const isLeap = year % 4 === 0 ? 1 : 0;
  const entireYear = {
    fullYear: year,
    months: Array.from(Array(12), (el, i) => ({monthNumber: i, fullYear: year})),
    days: [],
  };

  for (let i = 0; i < 365 + isLeap; i++) {
    let date = splitDate(currentConstructorDate);
    entireYear.days.push(date);
    currentConstructorDate = new Date(date.fullYear, date.monthNumber, date.day + 1);
  }
  return entireYear;
}
export function buildEntireCalendar(NUMBER_OF_YEARS) {
  const entireCalendar = {};
  for (let i = gYear(TODAY); i < gYear(TODAY) + NUMBER_OF_YEARS; i++) {
    entireCalendar[i] = buildYear(i);
  }
  const c = {m: gMonth(TODAY), d: gDay(TODAY), y: gYear(TODAY)};
  entireCalendar[c.y].months = entireCalendar[c.y].months.filter(el => el.monthNumber >= c.m);
  entireCalendar[c.y].days = entireCalendar[c.y].days.filter(
    el => el.monthNumber > c.m || (el.monthNumber === c.m && el.day >= c.d)
  );
  return entireCalendar;
}
export function buildCalendar(NUMBER_OF_DAYS, NUMBER_OF_MONTHS, PREPEND_MONTHS, fullMonths) {
  if (NUMBER_OF_MONTHS !== 12) NUMBER_OF_DAYS = computeDaysFromMonths(NUMBER_OF_MONTHS);
  else if (NUMBER_OF_DAYS !== 365) NUMBER_OF_MONTHS = computeMonthFromDays(NUMBER_OF_DAYS);

  const calendar = {
    days: createDaysArray(NUMBER_OF_DAYS, fullMonths),
    months: [...createPrependArray(PREPEND_MONTHS), ...createMonthsArray(NUMBER_OF_MONTHS)],
  };

  return calendar;
}
