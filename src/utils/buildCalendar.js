const TODAY = new Date();
const gWeekDay = date => date.getDay();
const gDay = date => date.getDate();
const gMonth = date => date.getMonth();
const gYear = date => date.getFullYear();

function computeMonthFromDays(NUMBER_OF_DAYS) {
  const NUMBER_OF_MONTHS =
    (Date.UTC(gYear(TODAY), gMonth(TODAY), gDay(TODAY) + NUMBER_OF_DAYS) -
      Date.UTC(gYear(TODAY), gMonth(TODAY), gDay(TODAY))) /
    (1000 * 60 * 60 * 24);
  return NUMBER_OF_MONTHS;
}
function computeDaysFromMonths(NUMBER_OF_MONTH) {
  const NUMBER_OF_DAYS =
    (Date.UTC(gYear(TODAY), gMonth(TODAY) + NUMBER_OF_MONTH) -
      Date.UTC(gYear(TODAY), gMonth(TODAY))) /
    (1000 * 60 * 60 * 24);
  return NUMBER_OF_DAYS;
}

function createDaysArray(NUMBER_OF_DAYS) {
  let currentConstructorDate = new Date();
  const days = [];

  for (let i = 0; i < NUMBER_OF_DAYS; i++) {
    let date = {
      dayOfTheWeek: gWeekDay(currentConstructorDate),
      day: gDay(currentConstructorDate),
      monthNumber: gMonth(currentConstructorDate),
      fullYear: gYear(currentConstructorDate),
    };
    days.push(date);
    currentConstructorDate = new Date(date.fullYear, date.monthNumber, date.day + 1);
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

export function buildCalendar(NUMBER_OF_DAYS, NUMBER_OF_MONTHS, PREPEND_MONTHS) {
  if (NUMBER_OF_DAYS !== 365 && NUMBER_OF_MONTHS === 12)
    NUMBER_OF_MONTHS = computeMonthFromDays(NUMBER_OF_DAYS);

  if (NUMBER_OF_MONTHS !== 12) NUMBER_OF_DAYS = computeDaysFromMonths(NUMBER_OF_MONTHS);

  const calendar = {
    days: createDaysArray(NUMBER_OF_DAYS),
    months: [...createPrependArray(PREPEND_MONTHS), ...createMonthsArray(NUMBER_OF_MONTHS)],
  };

  return calendar;
}
