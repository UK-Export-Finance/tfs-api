import { PROPERTIES } from '@ukef/constants';
import { AcbsFacilityPartyService } from '@ukef/modules/acbs/acbs-facility-party.service';
import { AcbsCreateFacilityPartyDto } from '@ukef/modules/acbs/dto/acbs-create-facility-party.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityInvestorService } from './facility-investor.service';
import { CreateFacilityInvestorRequestItem } from './dto/create-facility-investor-request.dto';

describe('FacilityInvestorService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();

  let service: FacilityInvestorService;

  let acbsFacilityPartyServiceCreatePartyForFacility: jest.Mock;

  beforeEach(() => {
    const acbsFacilityPartyService = new AcbsFacilityPartyService(null, null);
    acbsFacilityPartyServiceCreatePartyForFacility = jest.fn();
    acbsFacilityPartyService.createPartyForFacility = acbsFacilityPartyServiceCreatePartyForFacility;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new FacilityInvestorService(acbsAuthenticationService, acbsFacilityPartyService, dateStringTransformations);
  });

  describe('createInvestorForFacility', () => {
    const facilityIdentifier = valueGenerator.facilityId();
    const {
      facilityStatus: { facilityStatusCode },
      involvedParty: { partyIdentifier: involvedPartyIdentifier },
      sectionIdentifier,
    } = PROPERTIES.FACILITY_INVESTOR.DEFAULT;
    const effectiveDate = TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY;
    const guaranteeExpiryDate = TEST_DATES.A_FUTURE_EXPIRY_DATE_ONLY;
    const lenderType = valueGenerator.stringOfNumericCharacters();
    const currency = TEST_CURRENCIES.A_TEST_CURRENCY;
    const maximumLiability = 12345.6;

    const newFacilityInvestorWithAllFields: CreateFacilityInvestorRequestItem = {
      effectiveDate: effectiveDate,
      guaranteeExpiryDate: guaranteeExpiryDate,
      lenderType,
      currency,
      maximumLiability,
    };

    const expectedNewFacilityInvestorToCreateWithAllFields = {
      FacilityStatus: {
        FacilityStatusCode: facilityStatusCode,
      },
      InvolvedParty: {
        PartyIdentifier: involvedPartyIdentifier,
      },
      EffectiveDate: dateStringTransformations.addTimeToDateOnlyString(effectiveDate),
      ExpirationDate: dateStringTransformations.addTimeToDateOnlyString(guaranteeExpiryDate),
      LenderType: {
        LenderTypeCode: lenderType,
      },
      SectionIdentifier: sectionIdentifier,
      Currency: {
        CurrencyCode: currency,
      },
      LimitAmount: maximumLiability,
      CustomerAdvisedIndicator: PROPERTIES.FACILITY_INVESTOR.DEFAULT.customerAdvisedIndicator,
      LimitRevolvingIndicator: PROPERTIES.FACILITY_INVESTOR.DEFAULT.limitRevolvingIndicator,
    };

    it('creates an facility party in ACBS with a transformation of the requested new investor', async () => {
      await service.createInvestorForFacility(facilityIdentifier, newFacilityInvestorWithAllFields);

      expect(acbsFacilityPartyServiceCreatePartyForFacility).toHaveBeenCalledWith(
        facilityIdentifier,
        expectedNewFacilityInvestorToCreateWithAllFields,
        idToken,
      );
    });

    it('adds a default value for lenderType before creating the facility party if it is not specified', async () => {
      const { lenderType: _removed, ...newInvestorWithoutLenderType } = newFacilityInvestorWithAllFields;

      await service.createInvestorForFacility(facilityIdentifier, newInvestorWithoutLenderType);

      const [createPartyForFacilityArgs] = acbsFacilityPartyServiceCreatePartyForFacility.mock.calls as [[unknown, AcbsCreateFacilityPartyDto]];
      const [, facilityPartyCreatedInAcbs] = createPartyForFacilityArgs;

      expect(facilityPartyCreatedInAcbs.LenderType.LenderTypeCode).toBe(PROPERTIES.FACILITY_INVESTOR.DEFAULT.lenderType.lenderTypeCode);
    });
  });
});
