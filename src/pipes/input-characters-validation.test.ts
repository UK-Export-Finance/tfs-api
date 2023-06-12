import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { InputCharacterValidationPipe } from './input-characters-validation';

class NoErrorThrownError extends Error {}

describe('InputCharacterValidationPipe', () => {
  const queryMeta: ArgumentMetadata = { type: 'query' };
  const paramMeta: ArgumentMetadata = { type: 'param' };
  const flatParamMeta: ArgumentMetadata = { type: 'param', data: 'field2' };
  const bodyMeta: ArgumentMetadata = { type: 'body' };
  const supportedCharacters = 'Test';
  const unsupportedUrlCharacters = 'Test &%*?<>#/\\:';
  const bodyWithUnsupportedCharacters = 'Company ŽİĞİŞ A.Ş';
  const unsupportedBodyCharacters: string =
    String.fromCharCode(381) +
    String.fromCharCode(304) +
    String.fromCharCode(286) +
    String.fromCharCode(304) +
    String.fromCharCode(350) +
    String.fromCharCode(350);
  const urlDto = { field1: supportedCharacters, field2: unsupportedUrlCharacters };
  const bodyDto = {
    field1: supportedCharacters,
    field2: {
      field2_1: supportedCharacters,
      field2_2: supportedCharacters,
    },
    field3: {
      field3_1: {
        field3_1_1: supportedCharacters,
      },
      field3_2: {
        field3_2_1: supportedCharacters,
        field3_2_2: supportedCharacters,
      },
      field3_3: [
        {
          field3_3_1: supportedCharacters,
          field3_3_2: supportedCharacters,
        },
        {
          field3_3_1: supportedCharacters,
          field3_3_2: supportedCharacters,
        },
      ],
    },
  };

  let pipe: InputCharacterValidationPipe;

  beforeEach(() => {
    pipe = new InputCharacterValidationPipe();
  });

  describe('transform', () => {
    it('throws an error if query param dto has unsupported characters', () => {
      const functionToTest = () => {
        try {
          pipe.transform(urlDto, queryMeta);
          return new NoErrorThrownError();
        } catch (error) {
          return error;
        }
      };

      const error = functionToTest();

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('response.error', `URL field field2 has invalid characters &%*?<>#/\\:.`);
    });

    it('throws an error if URL param dto has unsupported characters', () => {
      const functionToTest = () => {
        try {
          pipe.transform(urlDto, paramMeta);
          return new NoErrorThrownError();
        } catch (error) {
          return error;
        }
      };

      const error = functionToTest();

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('response.error', `URL field field2 has invalid characters &%*?<>#/\\:.`);
    });

    it('throws an error if URL flat param dto has unsupported characters', () => {
      const functionToTest = () => {
        try {
          pipe.transform(urlDto['field2'], flatParamMeta);
          return new NoErrorThrownError();
        } catch (error) {
          return error;
        }
      };

      const error = functionToTest();

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('response.error', `URL field field2 has invalid characters &%*?<>#/\\:.`);
    });

    it('URL param dto with unsupported characters is returned when metadata type is body', () => {
      const response = pipe.transform(urlDto, bodyMeta);

      expect(response).toEqual(urlDto);
    });

    it('URL param dto with no unsupported characters is returned when metadata type is param', () => {
      const supportedUrlDto = {
        ...urlDto,
        field2: supportedCharacters,
      };
      const response = pipe.transform(supportedUrlDto, paramMeta);

      expect(response).toEqual(supportedUrlDto);
    });

    it('Body dto with no unsupported characters in object properties is returned when metadata type is body', () => {
      const response = pipe.transform(bodyDto, bodyMeta);

      expect(response).toEqual(bodyDto);
    });

    it('throws an error if Body param dto has unsupported characters in object properties', () => {
      const issueInLevel1 = { ...bodyDto, field1: bodyWithUnsupportedCharacters };
      const functionToTest = () => {
        try {
          pipe.transform(issueInLevel1, bodyMeta);
          return new NoErrorThrownError();
        } catch (error) {
          return error;
        }
      };

      const error = functionToTest();

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('response.error', `Field field1 has invalid characters ${unsupportedBodyCharacters}.`);
    });

    it('throws an error if Body param dto has unsupported characters in object child properties', () => {
      const issueInLevel2 = { ...bodyDto, field2: { field2_2: bodyWithUnsupportedCharacters } };
      const functionToTest = () => {
        try {
          pipe.transform(issueInLevel2, bodyMeta);
          return new NoErrorThrownError();
        } catch (error) {
          return error;
        }
      };

      const error = functionToTest();

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('response.error', `Field field2_2 has invalid characters ${unsupportedBodyCharacters}.`);
    });

    it('throws an error if Body param dto has unsupported characters in object grandchild properties', () => {
      const issueInLevel3 = { ...bodyDto, field3: { field3_3: { field3_3_2: bodyWithUnsupportedCharacters } } };
      const functionToTest = () => {
        try {
          pipe.transform(issueInLevel3, bodyMeta);
          return new NoErrorThrownError();
        } catch (error) {
          return error;
        }
      };

      const error = functionToTest();

      expect(error).not.toBeInstanceOf(NoErrorThrownError);
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error).toHaveProperty('response.error', `Field field3_3_2 has invalid characters ${unsupportedBodyCharacters}.`);
    });

    describe('Validate that known ASCII characters pass', () => {
      for (let i = 32; i <= 126; i++) {
        it('no error for ascii ' + i, () => {
          const bodyToTest = { ...bodyDto, field1: String.fromCharCode(i) };
          const functionToTest = () => {
            pipe.transform(bodyToTest, bodyMeta);
          };

          expect(functionToTest).not.toThrow();
        });
      }
      // ACBS doesn't support characters 181 µ and 255 ÿ
      for (let i = 160; i <= 254; i++) {
        if (i === 181) {
          continue;
        }

        it('no error for ascii ' + i, () => {
          const bodyToTest = { ...bodyDto, field1: String.fromCharCode(i) };
          const functionToTest = () => {
            pipe.transform(bodyToTest, bodyMeta);
          };

          expect(functionToTest).not.toThrow();
        });
      }

      it('throws an error if Body param dto has ASCII character 181 in object properties', () => {
        const bodyToTest = { ...bodyDto, field1: String.fromCharCode(181) };
        const functionToTest = () => {
          try {
            pipe.transform(bodyToTest, bodyMeta);
            return new NoErrorThrownError();
          } catch (error) {
            return error;
          }
        };

        const error = functionToTest();

        expect(error).not.toBeInstanceOf(NoErrorThrownError);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error).toHaveProperty('response.error', 'Field field1 has invalid characters µ.');
      });

      it('throws an error if Body param dto has ASCII character 255 in object properties', () => {
        const bodyToTest = { ...bodyDto, field1: String.fromCharCode(255) };
        const functionToTest = () => {
          try {
            pipe.transform(bodyToTest, bodyMeta);
            return new NoErrorThrownError();
          } catch (error) {
            return error;
          }
        };

        const error = functionToTest();

        expect(error).not.toBeInstanceOf(NoErrorThrownError);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error).toHaveProperty('response.error', 'Field field1 has invalid characters ÿ.');
      });
    });
  });
});
