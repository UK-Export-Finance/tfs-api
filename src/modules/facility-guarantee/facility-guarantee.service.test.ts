import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityGuaranteeService } from '@ukef/modules/acbs/acbs-facility-guarantee.service';
import { AcbsCreateFacilityGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-create-facility-guarantee.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { GetFacilityGuaranteeGenerator } from '@ukef-test/support/generator/get-facility-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityGuaranteeService } from './facility-guarantee.service';
import { FacilityGuaranteeToCreate } from './facility-guarantee-to-create.interface';

describe('FacilityGuaranteeService', () => {
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { facilityGuarantees: expectedFacilityGuarantees, facilityGuaranteesInAcbs } = new GetFacilityGuaranteeGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityGuaranteeService;

  let getFacilityGuaranteesAcbsService: jest.Mock;
  let createFacilityGuaranteesAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsFacilityGuaranteeService(null, null);
    getFacilityGuaranteesAcbsService = jest.fn();
    acbsService.getGuaranteesForFacility = getFacilityGuaranteesAcbsService;
    createFacilityGuaranteesAcbsService = jest.fn();
    acbsService.createGuaranteeForFacility = createFacilityGuaranteesAcbsService;

    service = new FacilityGuaranteeService(acbsAuthenticationService, acbsService, dateStringTransformations, new CurrentDateProvider());
  });

  describe('getGuaranteesForFacility', () => {
    it('returns a transformation of the guarantees from ACBS', async () => {
      when(getFacilityGuaranteesAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce(facilityGuaranteesInAcbs);

      const guarantees = await service.getGuaranteesForFacility(facilityIdentifier);

      expect(guarantees).toStrictEqual(expectedFacilityGuarantees);
    });

    it('returns an empty array if ACBS returns an empty array', async () => {
      when(getFacilityGuaranteesAcbsService).calledWith(portfolioIdentifier, facilityIdentifier, idToken).mockResolvedValueOnce([]);

      const guarantees = await service.getGuaranteesForFacility(facilityIdentifier);

      expect(guarantees).toStrictEqual([]);
    });
  });

  describe('createGuaranteeForFacility', () => {
    const facilityIdentifier = valueGenerator.facilityId();
    const limitKey = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guarantorParty = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters({ maxLength: 3 });
    const effectiveDate = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
    const now = new Date();
    const todayAsDateOnlyString = dateStringTransformations.removeTime(now.toISOString());
    const expirationDate = valueGenerator.dateOnlyString();
    const maximumLiabilityWithOneDecimalPlace = Number(valueGenerator.nonnegativeFloat().toFixed(1));

    const newGuaranteeWithAllFields: FacilityGuaranteeToCreate = {
      facilityIdentifier,
      effectiveDate,
      guarantorParty,
      limitKey,
      guaranteeExpiryDate: expirationDate,
      maximumLiability: maximumLiabilityWithOneDecimalPlace,
      guaranteeTypeCode,
    };

    it('creates a guarantee in ACBS with a transformation of the requested new guarantee', async () => {
      const expectedNewGuaranteeToCreate: AcbsCreateFacilityGuaranteeDto = {
        LenderType: {
          LenderTypeCode: PROPERTIES.FACILITY_GUARANTEE.DEFAULT.lenderType.lenderTypeCode,
        },
        SectionIdentifier: PROPERTIES.FACILITY_GUARANTEE.DEFAULT.sectionIdentifier,
        LimitType: {
          LimitTypeCode: PROPERTIES.FACILITY_GUARANTEE.DEFAULT.limitType.limitTypeCode,
        },
        LimitKey: limitKey,
        GuarantorParty: {
          PartyIdentifier: guarantorParty,
        },
        GuaranteeType: {
          GuaranteeTypeCode: guaranteeTypeCode,
        },
        EffectiveDate: dateStringTransformations.addTimeToDateOnlyString(effectiveDate),
        ExpirationDate: dateStringTransformations.addTimeToDateOnlyString(expirationDate),
        GuaranteedLimit: maximumLiabilityWithOneDecimalPlace,
        GuaranteedPercentage: PROPERTIES.FACILITY_GUARANTEE.DEFAULT.guaranteedPercentage,
      };

      await service.createGuaranteeForFacility(facilityIdentifier, newGuaranteeWithAllFields);

      expect(createFacilityGuaranteesAcbsService).toHaveBeenCalledWith(facilityIdentifier, expectedNewGuaranteeToCreate, idToken);
    });

    it(`replaces effectiveDate with today's date if effectiveDate is after today`, async () => {
      const newGuaranteeWithFutureEffectiveDate = {
        ...newGuaranteeWithAllFields,
        effectiveDate: TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY,
      };
      await service.createGuaranteeForFacility(facilityIdentifier, newGuaranteeWithFutureEffectiveDate);

      const guaranteeCreatedInAcbs: AcbsCreateFacilityGuaranteeDto = createFacilityGuaranteesAcbsService.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.EffectiveDate).toBe(dateStringTransformations.addTimeToDateOnlyString(todayAsDateOnlyString));
    });

    it(`does NOT replace effectiveDate with today's date if effectiveDate is NOT after today`, async () => {
      await service.createGuaranteeForFacility(facilityIdentifier, newGuaranteeWithAllFields);

      const guaranteeCreatedInAcbs: AcbsCreateFacilityGuaranteeDto = createFacilityGuaranteesAcbsService.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.EffectiveDate).toBe(dateStringTransformations.addTimeToDateOnlyString(effectiveDate));
    });

    it('rounds the maximumLiability to 2 decimal places', async () => {
      const maximumLiabilityWithMoreThanTwoDecimalPlaces = 1.12345;
      const maximumLiabilityRoundedToTwoDecimalPlaces = 1.12;
      const newGuaranteeWithMaximumLiabilityToRound = { ...newGuaranteeWithAllFields, maximumLiability: maximumLiabilityWithMoreThanTwoDecimalPlaces };

      await service.createGuaranteeForFacility(facilityIdentifier, newGuaranteeWithMaximumLiabilityToRound);

      const guaranteeCreatedInAcbs: AcbsCreateFacilityGuaranteeDto = createFacilityGuaranteesAcbsService.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.GuaranteedLimit).toBeCloseTo(maximumLiabilityRoundedToTwoDecimalPlaces, 8);
    });
  });
});
