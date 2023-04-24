import { PROPERTIES } from '@ukef/constants';

import { CreateFacilityRequestItem } from '../dto/create-facility-request.dto';
import { CreateFacilityTestPartsArgs } from './create-facility-test-parts-args.interface';

export const withCreateFacilityCapitalConversionFactorCodeTests = ({
  valueGenerator,
  createFacility,
  facilityToCreate,
  getFacilityCreatedInAcbs,
}: Omit<CreateFacilityTestPartsArgs, 'dateStringTransformations'>) => {
  describe('capitalConversionFactorCode', () => {
    it('sets CapitalConversionFactor.CapitalConversionFactorCode to capitalConversionFactorCode from request if it is specified', async () => {
      const capitalConversionFactorCode = valueGenerator.string();
      const facilityToCreateWithCapitalConversionFactorCode = {
        ...facilityToCreate,
        capitalConversionFactorCode,
      };

      await createFacility(facilityToCreateWithCapitalConversionFactorCode);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.CapitalConversionFactor.CapitalConversionFactorCode).toBe(capitalConversionFactorCode);
    });

    it(`sets CapitalConversionFactor.CapitalConversionFactorCode to default PROPERTIES value for productTypeId '250' if it is not specified in the request and the productTypeId is '250'`, async () => {
      const { capitalConversionFactorCode: _removed, ...facilityToCreateWithoutCapitalConversionFactorCode } = {
        ...facilityToCreate,
        productTypeId: '250',
      };

      await createFacility(facilityToCreateWithoutCapitalConversionFactorCode as CreateFacilityRequestItem);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.CapitalConversionFactor.CapitalConversionFactorCode).toBe(
        PROPERTIES.FACILITY.DEFAULT.POST.capitalConversionFactorCode['250'],
      );
    });

    it(`sets CapitalConversionFactor.CapitalConversionFactorCode to default PROPERTIES value for productTypeId '260' if it is not specified in the request and the productTypeId is '260'`, async () => {
      const { capitalConversionFactorCode: _removed, ...facilityToCreateWithoutCapitalConversionFactorCode } = {
        ...facilityToCreate,
        productTypeId: '260',
      };

      await createFacility(facilityToCreateWithoutCapitalConversionFactorCode as CreateFacilityRequestItem);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.CapitalConversionFactor.CapitalConversionFactorCode).toBe(
        PROPERTIES.FACILITY.DEFAULT.POST.capitalConversionFactorCode['260'],
      );
    });

    it(`sets CapitalConversionFactor.CapitalConversionFactorCode to fallback values from PROPERTIES if it is not specified in the request and the productTypeId is not '250' or '260'`, async () => {
      const { capitalConversionFactorCode: _removed, ...facilityToCreateWithoutCapitalConversionFactorCode } = facilityToCreate;

      await createFacility(facilityToCreateWithoutCapitalConversionFactorCode as CreateFacilityRequestItem);

      const facilityCreatedInAcbs = getFacilityCreatedInAcbs();

      expect(facilityCreatedInAcbs.CapitalConversionFactor.CapitalConversionFactorCode).toBe(
        PROPERTIES.FACILITY.DEFAULT.POST.capitalConversionFactorCodeFallback,
      );
    });
  });
};
