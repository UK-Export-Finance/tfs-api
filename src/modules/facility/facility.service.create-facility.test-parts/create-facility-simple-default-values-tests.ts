import { PROPERTIES } from '@ukef/constants';
import { AcbsCreateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-create-facility-request.dto';

import { CreateFacilityRequestItem } from '../dto/create-facility-request.dto';
import { CreateFacilityTestPartsArgs } from './create-facility-test-parts-args.interface';

export const withCreateFacilitySimpleDefaultValuesTests = ({
  valueGenerator,
  createFacility,
  facilityToCreate,
  getFacilityCreatedInAcbs,
}: Omit<CreateFacilityTestPartsArgs, 'dateStringTransformations'>) => {
  describe('simple default values', () => {
    const defaultValueTests: {
      keyInRequest: keyof CreateFacilityRequestItem;
      keyAffectedInAcbs: keyof AcbsCreateFacilityRequest;
      defaultValueForAcbs: unknown;
      validRequestValue: unknown;
    }[] = [
      {
        keyInRequest: 'probabilityOfDefault',
        keyAffectedInAcbs: 'ProbabilityofDefault',
        defaultValueForAcbs: PROPERTIES.FACILITY.DEFAULT.POST.probabilityofDefault,
        validRequestValue: valueGenerator.nonnegativeFloat(),
      },
    ];

    it.each(defaultValueTests)(
      'sets a default of $defaultValueForAcbs for $keyAffectedInAcbs if $keyInRequest is not specified',
      async ({ keyInRequest, keyAffectedInAcbs, defaultValueForAcbs }) => {
        const { [keyInRequest]: _removed, ...facilityToCreateWithoutKey } = facilityToCreate;

        await createFacility(facilityToCreateWithoutKey as CreateFacilityRequestItem);

        const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

        expect(facilityCreatedInAcbs[keyAffectedInAcbs]).toBe(defaultValueForAcbs);
      },
    );

    it.each(defaultValueTests)(
      'uses $keyInRequest from the request for $keyAffectedInAcbs if it is specified',
      async ({ keyInRequest, keyAffectedInAcbs, validRequestValue }) => {
        const facilityToCreateWithKey = {
          ...facilityToCreate,
          [keyInRequest]: validRequestValue,
        };

        await createFacility(facilityToCreateWithKey);

        const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

        expect(facilityCreatedInAcbs[keyAffectedInAcbs]).toBe(validRequestValue);
      },
    );
  });
};
