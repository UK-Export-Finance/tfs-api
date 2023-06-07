import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

import { InputCharacterValidationPipe } from './input-characters-validation';

describe('InputCharacterValidationPipe', () => {
  const queryMeta = { type: 'query' };
  const paramMeta = { type: 'param' };
  const flatParamMeta = { type: 'param', data: 'field2' };
  const bodyMeta = { type: 'body' };
  const unknownMeta = { type: '123' };
  const urlDto = { field1: 'Test', field2: 'Test &%*?<>#/\\:' };
  const bodyTextWithUnsupportedCharacters = 'Company ŽİĞİŞ A.Ş';
  const bodyDto = {
    field1: 'Test',
    field2: {
      field2_1: 'Test',
      field2_2: 'Test',
    },
    field3: {
      field3_1: {
        field3_1_1: 'Test',
      },
      field3_2: {
        field3_2_1: 'Test',
        field3_2_2: 'Test',
      },
      field3_3: [
        {
          field3_3_1: 'Test',
          field3_3_2: 'Test',
        },
        {
          field3_3_1: 'Test',
          field3_3_2: 'Test',
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
        pipe.transform(urlDto, queryMeta);
      };

      expect(functionToTest).toThrow(BadRequestException);
      expect(functionToTest).toThrow('Bad request');
    });

    it('throws an error if URL param dto has unsupported characters', () => {
      const functionToTest = () => {
        pipe.transform(urlDto, paramMeta);
      };

      expect(functionToTest).toThrow(BadRequestException);
      expect(functionToTest).toThrow('Bad request');
    });

    it('throws an error if URL flat param dto has unsupported characters', () => {
      const functionToTest = () => {
        pipe.transform(urlDto['field2'], flatParamMeta);
      };

      expect(functionToTest).toThrow(BadRequestException);
      expect(functionToTest).toThrow('Bad request');
    });

    it('same request works in body dto', () => {
      const functionToTest = () => {
        pipe.transform(urlDto, bodyMeta);
      };

      expect(functionToTest).not.toThrow();
    });

    it('throws internal exception for unknown input type', () => {
      const functionToTest = () => {
        pipe.transform(urlDto, unknownMeta);
      };

      expect(functionToTest).toThrow(InternalServerErrorException);
    });

    it('no error for simple Body values dto has unsupported characters in object properties', () => {
      const functionToTest = () => {
        pipe.transform(bodyDto, bodyMeta);
      };

      expect(functionToTest).not.toThrow();
    });

    it('throws an error if Body param dto has unsupported characters in object properties', () => {
      const issueInLevel1 = { ...bodyDto, field1: bodyTextWithUnsupportedCharacters };
      const functionToTest = () => {
        pipe.transform(issueInLevel1, bodyMeta);
      };

      expect(functionToTest).toThrow(BadRequestException);
    });

    it('throws an error if Body param dto has unsupported characters in object child properties', () => {
      const issueInLevel2 = { ...bodyDto, field2: { field2_2: bodyTextWithUnsupportedCharacters } };
      const functionToTest = () => {
        pipe.transform(issueInLevel2, bodyMeta);
      };

      expect(functionToTest).toThrow(BadRequestException);
    });

    it('throws an error if Body param dto has unsupported characters in object grandchild properties', () => {
      const issueInLevel3 = { ...bodyDto, field3: { field3_3: { field3_3_2: bodyTextWithUnsupportedCharacters } } };
      const functionToTest = () => {
        pipe.transform(issueInLevel3, bodyMeta);
      };

      expect(functionToTest).toThrow(BadRequestException);
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
          pipe.transform(bodyToTest, bodyMeta);
        };

        expect(functionToTest).toThrow(BadRequestException);
      });

      it('throws an error if Body param dto has ASCII character 255 in object properties', () => {
        const bodyToTest = { ...bodyDto, field1: String.fromCharCode(255) };
        const functionToTest = () => {
          pipe.transform(bodyToTest, bodyMeta);
        };

        expect(functionToTest).toThrow(BadRequestException);
      });
    });
  });
});
