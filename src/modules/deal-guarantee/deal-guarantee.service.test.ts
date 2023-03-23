import { PROPERTIES } from '@ukef/constants';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsDealGuaranteeService } from '@ukef/modules/acbs/acbs-deal-guarantee.service';
import { AcbsCreateDealGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-create-deal-guarantee.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealGuaranteeService } from './deal-guarantee.service';
import { DealGuaranteeToCreate } from './deal-guarantee-to-create.interface';

jest.mock('@ukef/modules/date/current-date.provider');
jest.mock('@ukef/modules/acbs/acbs-deal-guarantee.service');
jest.mock('@ukef/modules/acbs/acbs-authentication.service');

describe('DealGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsDealGuaranteeService: AcbsDealGuaranteeService;
  let currentDateProvider: CurrentDateProvider;
  let service: DealGuaranteeService;

  let acbsDealGuaranteeServiceCreateGuaranteeForDeal: jest.Mock;
  let currentDateProviderGetLatestDateFromTodayAnd: jest.Mock;

  beforeEach(() => {
    acbsDealGuaranteeService = new AcbsDealGuaranteeService(null, null);
    acbsDealGuaranteeServiceCreateGuaranteeForDeal = jest.fn();
    acbsDealGuaranteeService.createGuaranteeForDeal = acbsDealGuaranteeServiceCreateGuaranteeForDeal;

    acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    const acbsAuthenticationServiceGetIdToken = jest.fn();
    acbsAuthenticationService.getIdToken = acbsAuthenticationServiceGetIdToken;

    currentDateProvider = new CurrentDateProvider();
    currentDateProviderGetLatestDateFromTodayAnd = jest.fn();
    currentDateProvider.getLatestDateFromTodayAnd = currentDateProviderGetLatestDateFromTodayAnd;

    service = new DealGuaranteeService(acbsAuthenticationService, acbsDealGuaranteeService, currentDateProvider);

    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);
  });

  describe('createGuaranteeForDeal', () => {
    const dealIdentifier = valueGenerator.stringOfNumericCharacters();
    const limitKey = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guarantorParty = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters({ maxLength: 3 });
    const effectiveDate = valueGenerator.dateOnlyString();
    const effectiveDateAsDate = new Date(effectiveDate + 'T00:00:00Z');
    const today = valueGenerator.date();
    const todayAsDateOnlyString = today.toISOString().split('T')[0];
    const expirationDate = valueGenerator.dateOnlyString();
    const maximumLiabilityWithOneDecimalPlace = Number(valueGenerator.nonnegativeFloat().toFixed(1));

    const newGuaranteeWithAllFields: DealGuaranteeToCreate = {
      dealIdentifier,
      effectiveDate,
      guarantorParty,
      limitKey,
      guaranteeExpiryDate: expirationDate,
      maximumLiability: maximumLiabilityWithOneDecimalPlace,
      guaranteeTypeCode,
    };

    it('creates a guarantee in ACBS with a transformation of the requested new guarantee', async () => {
      const expectedNewGuaranteeToCreate: AcbsCreateDealGuaranteeDto = {
        LenderType: {
          LenderTypeCode: PROPERTIES.DEAL_GUARANTEE.DEFAULT.lenderType.lenderTypeCode,
        },
        SectionIdentifier: PROPERTIES.DEAL_GUARANTEE.DEFAULT.sectionIdentifier,
        LimitType: {
          LimitTypeCode: PROPERTIES.DEAL_GUARANTEE.DEFAULT.limitType.limitTypeCode,
        },
        LimitKey: limitKey,
        GuarantorParty: {
          PartyIdentifier: guarantorParty,
        },
        GuaranteeType: {
          GuaranteeTypeCode: guaranteeTypeCode,
        },
        EffectiveDate: effectiveDate + 'T00:00:00Z',
        ExpirationDate: expirationDate + 'T00:00:00Z',
        GuaranteedLimit: maximumLiabilityWithOneDecimalPlace,
        GuaranteedPercentage: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteedPercentage,
      };
      when(currentDateProviderGetLatestDateFromTodayAnd).calledWith(effectiveDateAsDate).mockReturnValueOnce(effectiveDateAsDate);

      await service.createGuaranteeForDeal(dealIdentifier, newGuaranteeWithAllFields);

      expect(acbsDealGuaranteeServiceCreateGuaranteeForDeal).toHaveBeenCalledWith(dealIdentifier, expectedNewGuaranteeToCreate, idToken);
    });

    it('adds a default value for guarantorParty before creating the new guarantee if it is not specified', async () => {
      const { guarantorParty: _removed, ...newGuaranteeWithoutGuarantorParty } = newGuaranteeWithAllFields;
      when(currentDateProviderGetLatestDateFromTodayAnd).calledWith(effectiveDateAsDate).mockReturnValueOnce(effectiveDateAsDate);

      await service.createGuaranteeForDeal(dealIdentifier, newGuaranteeWithoutGuarantorParty);

      const guaranteeCreatedInAcbs: AcbsCreateDealGuaranteeDto = acbsDealGuaranteeServiceCreateGuaranteeForDeal.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.GuarantorParty.PartyIdentifier).toBe(PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty);
    });

    it('adds a default value for guaranteeTypeCode before creating the new guarantee if it is not specified', async () => {
      const { guaranteeTypeCode: _removed, ...newGuaranteeWithoutGuaranteeTypeCode } = newGuaranteeWithAllFields;
      when(currentDateProviderGetLatestDateFromTodayAnd).calledWith(effectiveDateAsDate).mockReturnValueOnce(effectiveDateAsDate);

      await service.createGuaranteeForDeal(dealIdentifier, newGuaranteeWithoutGuaranteeTypeCode);

      const guaranteeCreatedInAcbs: AcbsCreateDealGuaranteeDto = acbsDealGuaranteeServiceCreateGuaranteeForDeal.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.GuaranteeType.GuaranteeTypeCode).toBe(PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteeTypeCode);
    });

    it(`replaces effectiveDate with today's date if effectiveDate is before today`, async () => {
      when(currentDateProviderGetLatestDateFromTodayAnd).calledWith(effectiveDateAsDate).mockReturnValueOnce(today);

      await service.createGuaranteeForDeal(dealIdentifier, newGuaranteeWithAllFields);

      const guaranteeCreatedInAcbs: AcbsCreateDealGuaranteeDto = acbsDealGuaranteeServiceCreateGuaranteeForDeal.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.EffectiveDate).toBe(todayAsDateOnlyString + 'T00:00:00Z');
    });

    it(`does NOT replace effectiveDate with today's date if effectiveDate is NOT before today`, async () => {
      when(currentDateProviderGetLatestDateFromTodayAnd).calledWith(effectiveDateAsDate).mockReturnValueOnce(effectiveDateAsDate);

      await service.createGuaranteeForDeal(dealIdentifier, newGuaranteeWithAllFields);

      const guaranteeCreatedInAcbs: AcbsCreateDealGuaranteeDto = acbsDealGuaranteeServiceCreateGuaranteeForDeal.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.EffectiveDate).toBe(effectiveDate + 'T00:00:00Z');
    });

    it('rounds the maximumLiability to 2 decimal places', async () => {
      const maximumLiabilityWithMoreThanTwoDecimalPlaces = 1.12345;
      const maximumLiabilityRoundedToTwoDecimalPlaces = 1.12;
      const newGuaranteeWithMaximumLiabilityToRound = { ...newGuaranteeWithAllFields, maximumLiability: maximumLiabilityWithMoreThanTwoDecimalPlaces };
      when(currentDateProviderGetLatestDateFromTodayAnd).calledWith(effectiveDateAsDate).mockReturnValueOnce(effectiveDateAsDate);

      await service.createGuaranteeForDeal(dealIdentifier, newGuaranteeWithMaximumLiabilityToRound);

      const guaranteeCreatedInAcbs: AcbsCreateDealGuaranteeDto = acbsDealGuaranteeServiceCreateGuaranteeForDeal.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.GuaranteedLimit).toBeCloseTo(maximumLiabilityRoundedToTwoDecimalPlaces, 8);
    });
  });
});
