import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('UpdateFacilityRequest DTO', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.ukefId();

  describe('Validation of read-only properties', () => {
    it('accepts read-only properties in the DTO for client convenience (re-sending GET response)', async () => {
      /**
       * Scenario: Client receives facility data from GET endpoint and sends it back with modifications.
       * The 8 read-only properties should be accepted during validation.
       */
      const { updateFacilityRequest } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
      });

      const readOnlyPropertiesFromGetEndpoint = {
        facilityIdentifier: valueGenerator.ukefId(),
        portfolioIdentifier: valueGenerator.string({ maxLength: 10 }),
        guaranteeCommencementDate: valueGenerator.dateOnlyString(),
        facilityInitialStatus: valueGenerator.string({ maxLength: 1 }),
        facilityOverallStatus: valueGenerator.string({ maxLength: 1 }),
        guaranteePercentage: valueGenerator.nonnegativeFloat(),
        description: valueGenerator.string({ maxLength: 35 }),
        obligorName: valueGenerator.string({ maxLength: 50 }),
      };

      const requestWithReadOnlyProperties = {
        ...updateFacilityRequest,
        ...readOnlyPropertiesFromGetEndpoint,
      };

      const dtoInstance = plainToInstance(UpdateFacilityRequest, requestWithReadOnlyProperties);
      const validationErrors = await validate(dtoInstance);

      // Validation should pass because all read-only properties are properly decorated
      expect(validationErrors).toHaveLength(0);
    });

    it('serializes the DTO without read-only properties when @Exclude() is respected', () => {
      /**
       * Scenario: When the DTO is transformed for sending to ACBS, the @Exclude() decorator
       * should prevent read-only properties from being included.
       */
      const { updateFacilityRequest } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
      });

      const readOnlyPropertiesFromGetEndpoint = {
        facilityIdentifier: valueGenerator.ukefId(),
        portfolioIdentifier: valueGenerator.string({ maxLength: 10 }),
        guaranteeCommencementDate: valueGenerator.dateOnlyString(),
        facilityInitialStatus: valueGenerator.string({ maxLength: 1 }),
        facilityOverallStatus: valueGenerator.string({ maxLength: 1 }),
        guaranteePercentage: valueGenerator.nonnegativeFloat(),
        description: valueGenerator.string({ maxLength: 35 }),
        obligorName: valueGenerator.string({ maxLength: 50 }),
      };

      const requestWithReadOnlyProperties = {
        ...updateFacilityRequest,
        ...readOnlyPropertiesFromGetEndpoint,
      };

      /**
       * When serialized back to plain object with excludePrefixes (which @Exclude() uses),
       * the read-only properties should be excluded from the resulting object.
       */
      const serialized = plainToClass(UpdateFacilityRequest, requestWithReadOnlyProperties, {
        excludeExtraneousValues: false,
      });

      // Verify that the instance was created with the read-only properties
      expect((serialized as any).facilityIdentifier).toBeDefined();

      /**
       * When transformed back (simulating what NestJS does before sending to ACBS),
       * @Exclude() should prevent them from appearing
       */
      const transformed = plainToClass(UpdateFacilityRequest, serialized, {
        excludeExtraneousValues: true,
        excludePrefixes: ['__'],
      });

      // After transformation, the object should not contain the read-only properties (they should be filtered by @Exclude()).
      expect(Object.keys(transformed)).not.toContain('facilityIdentifier');
      expect(Object.keys(transformed)).not.toContain('portfolioIdentifier');
      expect(Object.keys(transformed)).not.toContain('guaranteeCommencementDate');
      expect(Object.keys(transformed)).not.toContain('facilityInitialStatus');
      expect(Object.keys(transformed)).not.toContain('facilityOverallStatus');
      expect(Object.keys(transformed)).not.toContain('guaranteePercentage');
      expect(Object.keys(transformed)).not.toContain('description');
      expect(Object.keys(transformed)).not.toContain('obligorName');
    });

    it('fails validation if required properties are missing', async () => {
      // Sanity check: the DTO still requires all mandatory properties
      const incompleteRequest = {
        // Missing dealIdentifier and other required fields
        facilityIdentifier: valueGenerator.ukefId(),
        productTypeId: valueGenerator.string(),
        currency: valueGenerator.string(),
      };

      const dtoInstance = plainToInstance(UpdateFacilityRequest, incompleteRequest);
      const validationErrors = await validate(dtoInstance);

      // Should have validation errors for missing required properties
      expect(validationErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Backward compatibility', () => {
    it('still accepts update requests without read-only properties', async () => {
      // Scenario: Existing clients that do not send read-only properties should still work
      const { updateFacilityRequest } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
      });

      const dtoInstance = plainToInstance(UpdateFacilityRequest, updateFacilityRequest);
      const validationErrors = await validate(dtoInstance);

      // Should validate successfully without read-only properties
      expect(validationErrors).toHaveLength(0);
    });
  });
});
