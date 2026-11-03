import { REGEX } from '@ukef/constants';
import { regexToString } from './regex.helper';

describe('Regex helper', () => {
  describe('regexToString', () => {
    it('replaces the leading and trailing forward slashes with an empty string', () => {
      // Arrange
      const regex = REGEX.TEST.TEST_STRING;

      // Act
      const regexString = regexToString(regex);

      // Assert
      expect(regexString).toBe('test');
    });

    it('escapes regexp forward slashes inside a string', () => {
      // Arrange
      const regex = REGEX.TEST.WORD_WITH_FORWARD_SLASH;

      // Act
      const regexString = regexToString(regex);

      // Assert
      expect(regexString).toBe('test\\/test');
    });

    it('escapes multiple back slashes inside a string', () => {
      // Arrange
      const regex = REGEX.TEST.WORD_CHARACTERS_WITHOUT_SURROUNDING_WHITESPACE;

      // Act
      const regexString = regexToString(regex);

      // Assert
      expect(regexString).toBe('^(?!\\s)[\\w\\-.()\\s]+(?<![\\s.])$');
    });

    it('escapes forward slashes inside a string', () => {
      // Arrange
      const regex = REGEX.TEST.WORD_CHARACTERS_WITH_SLASHES;

      // Act
      const regexString = regexToString(regex);

      // Assert
      expect(regexString).toBe('^[\\w\\-:/\\\\()\\s]+$');
    });
  });
});
