import * as buildCalendar from '@/utils/buildCalendar';
import {abr} from '@/utils/filters';

describe('buildCalendar', () => {
  it('should build return the days number', () => {
    let result = abr('abcdef');
    let result2 = abr();
    expect(result).toMatch('ABC');
    expect(result2).toBe('');
  });
  it('should build return the days number', () => {
    let result = buildCalendar.computeMonthFromDays(50);
    expect(result).toEqual(2);
  });
  it('should build return the days number', () => {
    let result = buildCalendar.computeDaysFromMonths(3);
    expect(result).toBeGreaterThan(88);
    expect(result).toBeLessThan(93);
  });
  it('should build return the days number', () => {
    let result = buildCalendar.createDaysArray(400, false);
    let result2 = buildCalendar.createDaysArray(1, true);
    expect(result.length).toEqual(400);
    expect(result2.length).not.toEqual(1);
    expect(result2.length).not.toBeGreaterThan(31);
  });
  it('should build return the days number', () => {
    let result = buildCalendar.createMonthsArray(12);
    expect(result.length).toEqual(13);
  });
  it('should build return the days number', () => {
    let result = buildCalendar.createPrependArray(5);
    let result2 = buildCalendar.createPrependArray(12);
    expect(result.length).toEqual(5);
    expect(result2.length).toEqual(12);
  });
  it('should build return the days number', () => {
    let result = buildCalendar.buildCalendar(365, 12, 1, false);
    expect(result.days.length).toEqual(365);
    expect(result.months.length).toEqual(14);
  });
});
