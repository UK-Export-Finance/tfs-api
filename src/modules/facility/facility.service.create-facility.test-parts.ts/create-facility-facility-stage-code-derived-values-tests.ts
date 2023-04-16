import { PROPERTIES } from '@ukef/constants';

import { CreateFacilityTestPartsArgs } from './create-facility-test-parts-args.interface';

export const withCreateFacilityFacilityStageCodeDerivedValuesTests = ({
  valueGenerator,
  dateStringTransformations,
  createFacility,
  facilityToCreate,
  getFacilityCreatedInAcbs,
}: CreateFacilityTestPartsArgs) => {
  describe('facilityStageCode derived fields', () => {
    it('sets CompBalPctReserve to default compBalPctReserveUnissued from PROPERTIES if facilityStageCode is 06', async () => {
      const facilityToCreateWithFacilityStageCode06 = {
        ...facilityToCreate,
        facilityStageCode: '06',
      };

      await createFacility(facilityToCreateWithFacilityStageCode06);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.CompBalPctReserve).toBe(PROPERTIES.FACILITY.DEFAULT.POST.compBalPctReserveUnissued);
    });

    it('sets CompBalPctReserve to default compBalPctReserveIssued from PROPERTIES  if facilityStageCode is NOT 06', async () => {
      const facilityToCreateWithFacilityStageCodeNot06 = {
        ...facilityToCreate,
        facilityStageCode: '07',
      };

      await createFacility(facilityToCreateWithFacilityStageCodeNot06);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.CompBalPctReserve).toBe(PROPERTIES.FACILITY.DEFAULT.POST.compBalPctReserveIssued);
    });

    it('sets UserDefinedDate1 to null if facilityStageCode is 06', async () => {
      const facilityToCreateWithFacilityStageCode06 = {
        ...facilityToCreate,
        facilityStageCode: '06',
      };

      await createFacility(facilityToCreateWithFacilityStageCode06);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.UserDefinedDate1).toBeNull();
    });

    it('sets UserDefinedDate1 to request issueDate if facilityStageCode is NOT 06', async () => {
      const issueDate = valueGenerator.dateOnlyString();
      const facilityToCreateWithFacilityStageCodeNot06 = {
        ...facilityToCreate,
        facilityStageCode: '07',
        issueDate,
      };

      await createFacility(facilityToCreateWithFacilityStageCodeNot06);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.UserDefinedDate1).toBe(dateStringTransformations.addTimeToDateOnlyString(issueDate));
    });

    it('sets IsUserDefinedDate1Zero to true if facilityStageCode is 06', async () => {
      const facilityToCreateWithFacilityStageCode06 = {
        ...facilityToCreate,
        facilityStageCode: '06',
      };

      await createFacility(facilityToCreateWithFacilityStageCode06);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.IsUserDefinedDate1Zero).toBe(true);
    });

    it('sets IsUserDefinedDate1Zero to false if facilityStageCode is NOT 06', async () => {
      const issueDate = valueGenerator.dateOnlyString();
      const facilityToCreateWithFacilityStageCodeNot06 = {
        ...facilityToCreate,
        facilityStageCode: '07',
        issueDate,
      };

      await createFacility(facilityToCreateWithFacilityStageCodeNot06);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.IsUserDefinedDate1Zero).toBe(false);
    });
  });
};
