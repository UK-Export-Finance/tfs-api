import { AcbsCreateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-create-facility-request.dto';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';

import { CreateFacilityTestPartsArgs } from './create-facility-test-parts-args.interface';

export const withCreateFacilityEffectiveDateTests = ({
  dateStringTransformations,
  createFacility,
  facilityToCreate,
  getFacilityCreatedInAcbs,
}: Omit<CreateFacilityTestPartsArgs, 'valueGenerator'>) => {
  describe('effectiveDate', () => {
    const effectiveDateTests: {
      affectedKeyInAcbs: keyof AcbsCreateFacilityRequest;
    }[] = [
      {
        affectedKeyInAcbs: 'OriginalEffectiveDate',
      },
      {
        affectedKeyInAcbs: 'OriginalApprovalDate',
      },
      {
        affectedKeyInAcbs: 'TargetClosingDate',
      },
    ];

    it.each(effectiveDateTests)('uses effectiveDate for $affectedKeyInAcbs if effectiveDate is before today', async ({ affectedKeyInAcbs }) => {
      const effectiveDateBeforeToday = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
      const facilityToCreateWithEffectiveDateBeforeToday = { ...facilityToCreate, effectiveDate: effectiveDateBeforeToday };

      await createFacility(facilityToCreateWithEffectiveDateBeforeToday);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs[affectedKeyInAcbs]).toBe(dateStringTransformations.addTimeToDateOnlyString(effectiveDateBeforeToday));
    });

    it.each(effectiveDateTests)('uses today for $affectedKeyInAcbs if effectiveDate is after today', async ({ affectedKeyInAcbs }) => {
      const effectiveDateAfterToday = TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY;
      const midnightToday = dateStringTransformations.getDateStringFromDate(new Date('2023-06-13'));
      const facilityToCreateWithEffectiveDateAfterToday = { ...facilityToCreate, effectiveDate: effectiveDateAfterToday };

      await createFacility(facilityToCreateWithEffectiveDateAfterToday);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs[affectedKeyInAcbs]).toBe(midnightToday);
    });
  });
};
