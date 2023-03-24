import { DateStringTransformations } from './date-string.transformations';

describe('DateStringTransformations', () => {
  const transformations = new DateStringTransformations();

  describe('dateOnlyStringToDateString', () => {
    it('converts a valid DateOnlyString to an ISO DateString', () => {
      expect(transformations.dateOnlyStringToDateString('1987-04-23')).toBe('1987-04-23T00:00:00Z');
    });

    it.each([['abc'], ['19870423'], ['87-04-23'], ['1987-04-23T12:34:56Z'], [null], [undefined]])(
      'throws a TypeError if the DateOnlyString is not in YYYY-MM-DD format (%s)',
      (invalidInput) => {
        const convertingTheInvalidInput = () => transformations.dateOnlyStringToDateString(invalidInput);

        expect(convertingTheInvalidInput).toThrow(TypeError);
        expect(convertingTheInvalidInput).toThrow(`${invalidInput} is not a valid DateOnlyString as it is not in YYYY-MM-DD format.`);
      },
    );
  });

  describe('removeTime', () => {
    it('removes the time part of a string', () => {
      expect(transformations.removeTime('1987-04-23T12:34:56Z')).toBe('1987-04-23');
    });

    it.each([
      { description: 'null', input: null },
      { description: 'undefined', input: undefined },
      { description: 'empty', input: '' },
    ])('throws a TypeError if the string is $description', ({ input }) => {
      const convertingTheInvalidInput = () => transformations.removeTime(input);

      expect(convertingTheInvalidInput).toThrow(TypeError);
      expect(convertingTheInvalidInput).toThrow(`Cannot remove the time from ${input}.`);
    });
  });

  describe('removeTimeIfExists', () => {
    it('removes the time part of a string', () => {
      expect(transformations.removeTimeIfExists('1987-04-23T12:34:56Z')).toBe('1987-04-23');
    });

    it.each([
      { description: 'null', input: null },
      { description: 'undefined', input: undefined },
      { description: 'empty', input: '' },
    ])('returns the original string if the string is $description', ({ input }) => {
      expect(transformations.removeTimeIfExists(input)).toBe(input);
    });
  });
});
