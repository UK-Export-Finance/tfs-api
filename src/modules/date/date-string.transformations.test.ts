import { DateStringTransformations } from './date-string.transformations';

describe('DateStringTransformations', () => {
  const dateStringTransformations = new DateStringTransformations();

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
});
