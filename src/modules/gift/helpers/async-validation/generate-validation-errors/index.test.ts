import { generateArrayOfErrors, generateErrorMessage, generateHighLevelErrors } from '.';

const mockFieldName = 'fieldX';

describe('modules/gift/helpers/async-validation/generate-validation-errors', () => {
  describe('generateErrorMessage', () => {
    const mockParentEntityName = 'fixedFees';
    const mockSupportedValues = ['A', 'B', 'C'];

    describe('when the provided fieldValue is NOT in the provided supportedValues array', () => {
      it('should return an error message string', () => {
        // Arrange & Act
        const result = generateErrorMessage({
          fieldName: mockFieldName,
          fieldValue: 'Z',
          index: 1,
          parentEntityName: mockParentEntityName,
          supportedValues: mockSupportedValues,
        });

        // Assert
        const expected = `${mockParentEntityName}.1.${mockFieldName} is not supported - Z`;

        expect(result).toEqual(expected);
      });
    });

    describe('when the provided fieldValue is in the provided supportedValues array', () => {
      it('should return undefined', () => {
        // Arrange & Act
        const result = generateErrorMessage({
          fieldName: mockFieldName,
          fieldValue: 'B',
          index: 1,
          parentEntityName: mockParentEntityName,
          supportedValues: mockSupportedValues,
        });

        // Assert
        expect(result).toBeUndefined();
      });
    });
  });

  describe('generateArrayOfErrors', () => {
    it('should return an array of error messages via generateErrorMessage', () => {
      // Arrange
      const mockFieldValues = ['A', 'B', 'C', 'D', 'Z'];
      const mockSupportedValues = ['A', 'C'];
      const mockParentEntityName = 'fixedFees';

      // Act
      const result = generateArrayOfErrors({
        fieldValues: mockFieldValues,
        supportedValues: mockSupportedValues,
        fieldName: mockFieldName,
        parentEntityName: mockParentEntityName,
      });

      // Assert
      const shareParams = {
        fieldName: mockFieldName,
        parentEntityName: mockParentEntityName,
        supportedValues: mockSupportedValues,
      };

      const expected = [
        generateErrorMessage({ ...shareParams, fieldValue: 'B', index: 1 }),
        generateErrorMessage({ ...shareParams, fieldValue: 'D', index: 3 }),
        generateErrorMessage({ ...shareParams, fieldValue: 'Z', index: 4 }),
      ];

      expect(result).toStrictEqual(expected);
    });
  });

  describe('generateHighLevelErrors', () => {
    describe('when a child entities is an array', () => {
      it('should return an array of errors via generateArrayOfErrors', () => {
        // Arrange
        const mockPayload = {
          overview: 'A',
          fixedFees: ['A', 'A', 'B', 'B', 'C', 'C', 'D'],
          obligations: ['B', 'B', 'A', 'A', 'C', 'C', 'D'],
        };

        const mockSupportedValues = ['A', 'C'];

        // Act
        const result = generateHighLevelErrors({
          payload: mockPayload,
          supportedValues: mockSupportedValues,
          fieldName: mockFieldName,
        });

        // Assert
        const expected = [
          ...generateArrayOfErrors({
            fieldValues: mockPayload.fixedFees,
            supportedValues: mockSupportedValues,
            fieldName: mockFieldName,
            parentEntityName: 'fixedFees',
          }),
          ...generateArrayOfErrors({
            fieldValues: mockPayload.obligations,
            supportedValues: mockSupportedValues,
            fieldName: mockFieldName,
            parentEntityName: 'obligations',
          }),
        ];

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when no child array entities are populated', () => {
      it('should return an empty array', () => {
        // Arrange
        const mockPayload = {
          overview: 'A',
          fixedFees: [],
          obligations: [],
        };

        const mockSupportedValues = ['A', 'B'];

        // Act
        const result = generateHighLevelErrors({
          payload: mockPayload,
          supportedValues: mockSupportedValues,
          fieldName: mockFieldName,
        });

        // Assert
        expect(result).toEqual([]);
      });
    });
  });
});
