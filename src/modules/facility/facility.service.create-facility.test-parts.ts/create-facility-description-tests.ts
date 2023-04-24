import { CreateFacilityRequestItem } from '../dto/create-facility-request.dto';
import { CreateFacilityTestPartsArgs } from './create-facility-test-parts-args.interface';

export const withCreateFacilityDescriptionTests = ({
  valueGenerator,
  createFacility,
  facilityToCreate,
  getFacilityCreatedInAcbs,
}: Omit<CreateFacilityTestPartsArgs, 'dateStringTransformations'>) => {
  describe('productTypeName and Description', () => {
    it('does not truncate productTypeName in the Description if it has fewer than 13 characters', async () => {
      const productTypeNameLength12 = valueGenerator.string({ length: 12 });
      const exposurePeriod = valueGenerator.string();
      const facilityToCreateWithProductTypeNameLength12 = {
        ...facilityToCreate,
        productTypeName: productTypeNameLength12,
        exposurePeriod,
      };

      await createFacility(facilityToCreateWithProductTypeNameLength12);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.Description).toBe(`${productTypeNameLength12} : ${exposurePeriod} Months`);
    });

    it('does not truncate productTypeName in the Description if it has 13 characters', async () => {
      const productTypeNameLength13 = valueGenerator.string({ length: 13 });
      const exposurePeriod = valueGenerator.string();
      const facilityToCreateWithProductTypeNameLength13 = {
        ...facilityToCreate,
        productTypeName: productTypeNameLength13,
        exposurePeriod,
      };

      await createFacility(facilityToCreateWithProductTypeNameLength13);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.Description).toBe(`${productTypeNameLength13} : ${exposurePeriod} Months`);
    });

    it('truncates productTypeName in the Description if it more than 13 characters', async () => {
      const firstThirteenCharacters = valueGenerator.string({ length: 13 });
      const productTypeNameLength14 = `${firstThirteenCharacters}a`;
      const exposurePeriod = valueGenerator.string();
      const facilityToCreateWithProductTypeNameLength14 = {
        ...facilityToCreate,
        productTypeName: productTypeNameLength14,
        exposurePeriod,
      };

      await createFacility(facilityToCreateWithProductTypeNameLength14);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.Description).toBe(`${firstThirteenCharacters} : ${exposurePeriod} Months`);
    });

    it('uses an empty string for an empty string productTypeName in the Description', async () => {
      const exposurePeriod = valueGenerator.string();
      const facilityToCreateWithEmptyStringProductTypeName = {
        ...facilityToCreate,
        productTypeName: '',
        exposurePeriod,
      };

      await createFacility(facilityToCreateWithEmptyStringProductTypeName);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.Description).toBe(` : ${exposurePeriod} Months`);
    });

    it('throws if the productTypeName is not defined', async () => {
      const exposurePeriod = valueGenerator.string();
      const { productTypeName: _removed, ...facilityToCreateWithoutProductTypeName } = {
        ...facilityToCreate,
        exposurePeriod,
      };

      const createFacilityPromise = createFacility(facilityToCreateWithoutProductTypeName as CreateFacilityRequestItem);

      await expect(createFacilityPromise).rejects.toBeInstanceOf(TypeError);
    });

    it('throws if the productTypeName is null', async () => {
      const exposurePeriod = valueGenerator.string();
      const facilityToCreateWithNullProductTypeName = {
        ...facilityToCreate,
        productTypeName: null,
        exposurePeriod,
      };

      const createFacilityPromise = createFacility(facilityToCreateWithNullProductTypeName as CreateFacilityRequestItem);

      await expect(createFacilityPromise).rejects.toBeInstanceOf(TypeError);
    });
  });
};
