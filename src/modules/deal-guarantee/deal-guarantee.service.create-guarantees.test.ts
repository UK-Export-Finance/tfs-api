import { PROPERTIES } from '@ukef/constants';
import { AcbsDealGuaranteeService } from '@ukef/modules/acbs/acbs-deal-guarantee.service';
import { AcbsCreateDealGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-create-deal-guarantee.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { DealGuaranteeService } from './deal-guarantee.service';
import { DealGuaranteeToCreate } from './deal-guarantee-to-create.interface';

jest.mock('@ukef/modules/date/current-date.provider');
jest.mock('@ukef/modules/acbs/acbs-deal-guarantee.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('DealGuaranteeService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();

  let service: DealGuaranteeService;

  let acbsDealGuaranteeServiceCreateGuaranteeForDeal: jest.Mock;
  let currentDateProviderGetLatestDateFromTodayAnd: jest.Mock;

  beforeEach(() => {
    const acbsDealGuaranteeService = new AcbsDealGuaranteeService(null, null);
    acbsDealGuaranteeServiceCreateGuaranteeForDeal = jest.fn();
    acbsDealGuaranteeService.createGuaranteeForDeal = acbsDealGuaranteeServiceCreateGuaranteeForDeal;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const currentDateProvider = new CurrentDateProvider();
    currentDateProviderGetLatestDateFromTodayAnd = jest.fn();
    currentDateProvider.getLatestDateFromTodayAnd = currentDateProviderGetLatestDateFromTodayAnd;

    service = new DealGuaranteeService(acbsAuthenticationService, acbsDealGuaranteeService, currentDateProvider, dateStringTransformations);
  });

  describe('createGuaranteeForDeal', () => {
    const dealIdentifier = valueGenerator.stringOfNumericCharacters();
    const limitKey = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guarantorParty = valueGenerator.stringOfNumericCharacters({ maxLength: 8 });
    const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters({ maxLength: 3 });
    const effectiveDate = valueGenerator.dateOnlyString();
    const effectiveDateAsDate = new Date(dateStringTransformations.addTimeToDateOnlyString(effectiveDate));
    const today = valueGenerator.date();
    const todayAsDateOnlyString = dateStringTransformations.removeTime(today.toISOString());
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
        EffectiveDate: dateStringTransformations.addTimeToDateOnlyString(effectiveDate),
        ExpirationDate: dateStringTransformations.addTimeToDateOnlyString(expirationDate),
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

      expect(guaranteeCreatedInAcbs.EffectiveDate).toBe(dateStringTransformations.addTimeToDateOnlyString(todayAsDateOnlyString));
    });

    it(`does NOT replace effectiveDate with today's date if effectiveDate is NOT before today`, async () => {
      when(currentDateProviderGetLatestDateFromTodayAnd).calledWith(effectiveDateAsDate).mockReturnValueOnce(effectiveDateAsDate);

      await service.createGuaranteeForDeal(dealIdentifier, newGuaranteeWithAllFields);

      const guaranteeCreatedInAcbs: AcbsCreateDealGuaranteeDto = acbsDealGuaranteeServiceCreateGuaranteeForDeal.mock.calls[0][1];

      expect(guaranteeCreatedInAcbs.EffectiveDate).toBe(dateStringTransformations.addTimeToDateOnlyString(effectiveDate));
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
