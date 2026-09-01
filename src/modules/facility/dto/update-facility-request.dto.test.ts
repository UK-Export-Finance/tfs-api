import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('UpdateFacilityRequest DTO', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.ukefId();

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

      const requestWithReadOnlyProperties = {
        ...updateFacilityRequest,
        ...readOnlyPropertiesFromGetEndpoint,
      };

      const dtoInstance = plainToInstance(UpdateFacilityRequest, requestWithReadOnlyProperties);
      const validationErrors = await validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: true });

      // Validation should pass because all read-only properties are properly decorated
      expect(validationErrors).toHaveLength(0);
    });

    it('serializes the DTO without read-only properties when @Exclude() is respected', async () => {
      /**
       * Scenario: When the DTO is transformed for sending to ACBS, the @Exclude() decorator
       * should prevent read-only properties from being included.
       */
      const { updateFacilityRequest } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({
        numberToGenerate: 1,
        facilityIdentifier,
      });

      const requestWithReadOnlyProperties = {
        ...updateFacilityRequest,
        ...readOnlyPropertiesFromGetEndpoint,
      };

      /**
       * Create a DTO instance from the request that includes read-only properties.
       * The @Exclude() decorator should prevent them from being set on the instance.
       */
      const dtoInstance = plainToInstance(UpdateFacilityRequest, requestWithReadOnlyProperties);

      /**
       * Validate that the instance passes validation despite the @Exclude() properties.
       * This verifies that @Exclude() properties are accepted during validation.
       */
      const validationErrors = await validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: true });

      expect(validationErrors).toHaveLength(0);

      /**
       * When we serialize the DTO back to a plain object using instanceToPlain,
       * the @Exclude() decorator should prevent the read-only properties from appearing
       */
      const serializedToPlain = instanceToPlain(dtoInstance);

      // After serialization, the object should not contain the read-only properties
      expect(Object.keys(serializedToPlain)).not.toContain('facilityIdentifier');
      expect(Object.keys(serializedToPlain)).not.toContain('portfolioIdentifier');
      expect(Object.keys(serializedToPlain)).not.toContain('guaranteeCommencementDate');
      expect(Object.keys(serializedToPlain)).not.toContain('facilityInitialStatus');
      expect(Object.keys(serializedToPlain)).not.toContain('facilityOverallStatus');
      expect(Object.keys(serializedToPlain)).not.toContain('guaranteePercentage');
      expect(Object.keys(serializedToPlain)).not.toContain('description');
      expect(Object.keys(serializedToPlain)).not.toContain('obligorName');
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
      const validationErrors = await validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: true });

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
      const validationErrors = await validate(dtoInstance, { whitelist: true, forbidNonWhitelisted: true });

      // Should validate successfully without read-only properties
      expect(validationErrors).toHaveLength(0);
    });
  });
});
