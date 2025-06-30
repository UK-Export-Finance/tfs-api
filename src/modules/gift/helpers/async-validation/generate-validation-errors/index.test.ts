import { generateMessage, generateValidationErrors } from '.';

const mockFieldName = 'fieldA';

describe('modules/gift/helpers/async-validation/generate-validation-errors', () => {
  describe('generateMessage', () => {
    it('should return an error message string', () => {
      // Arrange
      const mockParentEntityName = 'fixedFees';

      // Act
      const result = generateMessage({ parentEntityName: 'fixedFees', fieldName: mockFieldName, fieldValue: 'B', index: 1 });

      // Assert
      const expected = `${mockParentEntityName}.1.${mockFieldName} is not supported - B`;

      expect(result).toEqual(expected);
    });
  });

  describe('generateValidationErrors', () => {
    describe('when child entities contain values that are NOT in the provided supportedValues array', () => {
      it('should return an array with validation errors for all entities', () => {
        // Arrange
        const mockPayload = {
          overview: 'A',
          fixedFees: ['A', 'A', 'B', 'B', 'C', 'C', 'D'],
          obligations: ['B', 'B', 'A', 'A', 'C', 'C', 'D'],
        };

        const mockSupportedValues = ['A', 'C'];

        // Act
        const result = generateValidationErrors({
          payload: mockPayload,
          supportedValues: mockSupportedValues,
          fieldName: mockFieldName,
        });

        // Assert
        const expected = [
          generateMessage({ parentEntityName: 'fixedFees', fieldName: mockFieldName, fieldValue: 'B', index: 2 }),
          generateMessage({ parentEntityName: 'fixedFees', fieldName: mockFieldName, fieldValue: 'B', index: 3 }),
          generateMessage({ parentEntityName: 'fixedFees', fieldName: mockFieldName, fieldValue: 'D', index: 6 }),
          generateMessage({ parentEntityName: 'obligations', fieldName: mockFieldName, fieldValue: 'B', index: 0 }),
          generateMessage({ parentEntityName: 'obligations', fieldName: mockFieldName, fieldValue: 'B', index: 1 }),
          generateMessage({ parentEntityName: 'obligations', fieldName: mockFieldName, fieldValue: 'D', index: 6 }),
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when child entities contain values that are in the provided supportedValues array', () => {
      it('should return an empty array', () => {
        // Arrange
        const mockPayload = {
          overview: 'A',
          fixedFees: ['A', 'A', 'C', 'C'],
          obligations: ['A', 'A', 'C', 'C'],
        };

        const mockSupportedValues = ['A', 'C'];

        // Act
        const result = generateValidationErrors({
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
