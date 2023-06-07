import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';

import { CurrentDateProvider } from './current-date.provider';
import { DateStringTransformations } from './date-string.transformations';

describe('DateStringTransformations', () => {
  const dateStringTransformations = new DateStringTransformations();
  const currentDateProvider = new CurrentDateProvider();

  describe('addTimeToDateOnlyString', () => {
    it('converts a valid DateOnlyString to an ISO DateString', () => {
      expect(dateStringTransformations.addTimeToDateOnlyString('1987-04-23')).toBe('1987-04-23T00:00:00Z');
    });

    it.each([['abc'], ['19870423'], ['87-04-23'], ['1987-04-23T12:34:56Z'], [null], [undefined]])(
      'throws a TypeError if the DateOnlyString is not in YYYY-MM-DD format (%s)',
      (invalidInput) => {
        const convertingTheInvalidInput = () => dateStringTransformations.addTimeToDateOnlyString(invalidInput);

        expect(convertingTheInvalidInput).toThrow(TypeError);
        expect(convertingTheInvalidInput).toThrow(`${invalidInput} is not a valid DateOnlyString as it is not in YYYY-MM-DD format.`);
      },
    );
  });

  describe('removeTime', () => {
    it('removes the time part of a string', () => {
      expect(dateStringTransformations.removeTime('1987-04-23T12:34:56Z')).toBe('1987-04-23');
    });

    it.each([
      { description: 'null', input: null },
      { description: 'undefined', input: undefined },
      { description: 'empty', input: '' },
    ])('throws a TypeError if the string is $description', ({ input }) => {
      const convertingTheInvalidInput = () => dateStringTransformations.removeTime(input);

      expect(convertingTheInvalidInput).toThrow(TypeError);
      expect(convertingTheInvalidInput).toThrow(`Cannot remove the time from ${input}.`);
    });
  });

  describe('removeTimeIfExists', () => {
    it('removes the time part of a string', () => {
      expect(dateStringTransformations.removeTimeIfExists('1987-04-23T12:34:56Z')).toBe('1987-04-23');
    });

    it.each([
      { description: 'null', input: null },
      { description: 'undefined', input: undefined },
      { description: 'empty', input: '' },
    ])('returns the original string if the string is $description', ({ input }) => {
      expect(dateStringTransformations.removeTimeIfExists(input)).toBe(input);
    });
  });

  describe('getDateStringFromDate', () => {
    it('gets the midnight date string from the date', () => {
      const dateTime = new Date('1987-04-23T01:00:00Z');

      expect(dateStringTransformations.getDateStringFromDate(dateTime)).toBe('1987-04-23T00:00:00Z');
    });

    it('gets the date in UTC instead of the original timezone', () => {
      const dateTimeCreatedWithTimezone = new Date('1987-04-23T01:00:00+02:00');

      expect(dateStringTransformations.getDateStringFromDate(dateTimeCreatedWithTimezone)).toBe('1987-04-22T00:00:00Z');
    });
  });

  describe('getDateOnlyStringFromDate', () => {
    it('gets the date only string from the date', () => {
      const dateTime = new Date('1987-04-23T01:00:00Z');

      expect(dateStringTransformations.getDateOnlyStringFromDate(dateTime)).toBe('1987-04-23');
    });

    it('gets the date in UTC instead of the original timezone', () => {
      const dateTimeCreatedWithTimezone = new Date('1987-04-23T01:00:00+02:00');

      expect(dateStringTransformations.getDateOnlyStringFromDate(dateTimeCreatedWithTimezone)).toBe('1987-04-22');
    });
  });

  describe('getDisplayDateFromDate', () => {
    it('returns the date in DD/MM/YYYY format', () => {
      const dateTime = new Date('1987-04-23T01:00:00Z');

      expect(dateStringTransformations.getDisplayDateFromDate(dateTime)).toBe('23/04/1987');
    });

    it('returns the date in DD/MM/YYYY format even if the day number could be a single digit', () => {
      const dateTime = new Date('1987-12-03T01:00:00Z');

      expect(dateStringTransformations.getDisplayDateFromDate(dateTime)).toBe('03/12/1987');
    });
  });

  describe('getDayFromDateOnlyString', () => {
    it('returns the day in DD format if the day number is a two digits', () => {
      const date = '1987-04-23';

      expect(dateStringTransformations.getDayFromDateOnlyString(date)).toBe(23);
    });

    it('returns the day in D format if the day number is a single digit', () => {
      const date = '1987-12-03';

      expect(dateStringTransformations.getDayFromDateOnlyString(date)).toBe(3);
    });
  });

  describe('getEarliestDateFromTodayAndDateAsString', () => {
    it('returns the parameter as an ISO DateString if parameter is in the past', () => {
      const dateBeforeToday = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;

      expect(dateStringTransformations.getEarliestDateFromTodayAndDateAsString(dateBeforeToday, currentDateProvider)).toBe(TEST_DATES.A_PAST_EFFECTIVE_DATE_STRING);
    });

    it('returns todays date as an ISO DateString if parameter is in the future', () => {
      const dateAfterToday = TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY;
      const midnightToday = dateStringTransformations.getDateStringFromDate(new Date());

      expect(dateStringTransformations.getEarliestDateFromTodayAndDateAsString(dateAfterToday, currentDateProvider)).toBe(midnightToday);
    });
  });

  describe('getDatePlusThreeMonths', () => {
    it.each([
      { date: '1987-04-23', expectedDate: '1987-07-23', description: '' },
      { date: '2000-01-01', expectedDate: '2000-04-01', description: 'when there is a leap year and short months' },
      { date: '2001-01-01', expectedDate: '2001-04-01', description: 'when DST shift -1 hour' },
      { date: '2001-09-01', expectedDate: '2001-12-01', description: 'when DST shift +1 hour' },
      { date: '2001-08-31', expectedDate: '2001-11-30', description: 'when input day is 31 and output month has 30 days' },
      { date: '2001-11-30', expectedDate: '2002-02-28', description: 'when input is 30th November and it is not a leap year' },
      { date: '1999-11-30', expectedDate: '2000-02-29', description: 'when input is 30th November and it is a leap year' },
      { date: '2004-02-29', expectedDate: '2004-05-29', description: 'when input is 29th February and it is a leap year' },
    ])(
      'returns the date plus three months in YYYY-MM-DD format $description',
      ({ date, expectedDate }) => {

      expect(dateStringTransformations.getDatePlusThreeMonths(date)).toBe(expectedDate);
      },
    );
  });
});
