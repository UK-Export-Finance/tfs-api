import { REGEX } from '@ukef/constants';
import { regexToString } from './regex.helper';

describe('Regex helper', () => {
  describe('regexToString', () => {
    it('replaces the leading and trailing forward slashes with an empty string', () => {
      // Arrange
      const regex = REGEX.TEST.SIMPLE_WORD;

      // Act
      const regexString = regexToString(regex);

      // Assert
      expect(regexString).toBe('test');
      expect(regexToString(regexString)).toEqual(regex);
    });

    it('escapes regexp forward slashes inside a string', () => {
      // Arrange
      const regex = REGEX.TEST.WORD_WITH_FORWARD_SLASH;

      // Act
      const regexString = regexToString(regex);

      // Assert
      expect(regexString).toBe('test\\/test');
      expect(regexToString(regexString)).toEqual(regex);
    });

    it('escapes multiple back slashes inside a string', () => {
      // Arrange
      const regex = REGEX.TEST.WORD_CHARACTERS_WITHOUT_SURROUNDING_WHITESPACE;

      // Act
      const regexString = regexToString(regex);

      // Assert
      expect(regexString).toBe('^(?!\\s)[\\w\\-.()\\s]+(?<![\\s.])$');
      expect(regexToString(regexString)).toEqual(regex);
    });

    it('escapes forward slashes inside a string', () => {
      // Arrange
      const regex = REGEX.TEST.WORD_CHARACTERS_WITH_SLASHES;

      // Act
      const regexString = regexToString(regex);

      // Assert
      expect(regexString).toBe('^[\\w\\-:/\\\\()\\s]+$');
      expect(regexToString(regexString)).toEqual(regex);
    });
  });
});
