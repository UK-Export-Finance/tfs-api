import { EXAMPLES } from '@ukef/constants';

import { mapEntitiesByField, stripPayload } from '.';

const {
  GIFT: { FACILITY_CREATION_PAYLOAD },
} = EXAMPLES;

describe('modules/gift/helpers/async-validation/strip-payload', () => {
  describe('mapEntitiesByField', () => {
    it('should return an array of field values', () => {
      // Arrange
      const mockEntities = [{ fieldA: 'A', fieldB: 'B' }, { fieldA: 'A', fieldB: 'B' }, { fieldC: 'C' }];
      const mockFieldName = 'fieldB';

      // Act
      const result = mapEntitiesByField(mockEntities, mockFieldName);

      // Assert
      const expected = ['B', 'B'];

      expect(result).toEqual(expected);
    });
  });

  describe('stripPayload', () => {
    it('should return a stripped payload', () => {
      // Arrange
      const mockPayload = FACILITY_CREATION_PAYLOAD;
      const mockFieldName = 'fieldB';

      // Act
      const result = stripPayload(mockPayload, mockFieldName);

      // Assert
      const expected = {
        overview: mockPayload.overview[`${mockFieldName}`],
        fixedFees: mapEntitiesByField(mockPayload.fixedFees, mockFieldName),
        obligations: mapEntitiesByField(mockPayload.obligations, mockFieldName),
      };

      expect(result).toEqual(expected);
    });

    describe('when fixedFees is not provided', () => {
      it('should return a stripped payload with a default empty fixedFees array', () => {
        // Arrange
        const mockPayload = {
          consumer: FACILITY_CREATION_PAYLOAD.consumer,
          overview: FACILITY_CREATION_PAYLOAD.overview,
          accrualSchedules: FACILITY_CREATION_PAYLOAD.accrualSchedules,
          counterparties: FACILITY_CREATION_PAYLOAD.counterparties,
          obligations: FACILITY_CREATION_PAYLOAD.obligations,
          repaymentProfiles: FACILITY_CREATION_PAYLOAD.repaymentProfiles,
          riskDetails: FACILITY_CREATION_PAYLOAD.riskDetails,
        };

        const mockFieldName = 'fieldB';

        // Act
        const result = stripPayload(mockPayload, mockFieldName);

        // Assert
        const expected = {
          overview: mockPayload.overview[`${mockFieldName}`],
          fixedFees: [],
          obligations: mapEntitiesByField(mockPayload.obligations, mockFieldName),
        };

        expect(result).toEqual(expected);
      });
    });
  });
});
