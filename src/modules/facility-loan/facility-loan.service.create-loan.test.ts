import { ENUMS } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityLoanService } from './facility-loan.service';
import { RepaymentScheduleBuilder } from './repayment-schedule.builder';
import { CALENDAR_IDENTIFIERS } from '@ukef/constants/calendar-identifiers.constant';

describe('FacilityLoanService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const dateStringTransformations = new DateStringTransformations();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanService;
  let acbsFacilityLoanService: AcbsFacilityLoanService;
  let acbsBundleInformationService: AcbsBundleInformationService;
  let repaymentScheduleBuilder: RepaymentScheduleBuilder;

  let acbsBundleInformationServiceCreateBundleInformation: jest.Mock;
  let repaymentScheduleBuilderGetRepaymentSchedules: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    acbsBundleInformationService = new AcbsBundleInformationService(null, null);
    acbsBundleInformationServiceCreateBundleInformation = jest.fn(() => ({
      BundleIdentifier: bundleIdentifier,
    }));
    acbsBundleInformationService.createBundleInformation = acbsBundleInformationServiceCreateBundleInformation;

    repaymentScheduleBuilder = new RepaymentScheduleBuilder(null);
    repaymentScheduleBuilderGetRepaymentSchedules = jest.fn();
    repaymentScheduleBuilder.getRepaymentSchedules = repaymentScheduleBuilderGetRepaymentSchedules;

    service = new FacilityLoanService(
      acbsAuthenticationService,
      acbsFacilityLoanService,
      acbsBundleInformationService,
      dateStringTransformations,
      new CurrentDateProvider(),
      repaymentScheduleBuilder,
    );
  });

  describe('createLoanForFacility', () => {
    const {
      acbsRequestBodyToCreateFacilityLoanGbp,
      acbsRequestBodyToCreateFacilityLoanNonGbp,
      requestBodyToCreateFacilityLoanGbp,
      requestBodyToCreateFacilityLoanNonGbp,
      bondRepaymentSchedulesGbp: bondRepaymentSchedules,
    } = new CreateFacilityLoanGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      bundleIdentifier,
    });
    const [newLoanGbp] = requestBodyToCreateFacilityLoanGbp;
    const [newLoanNonGbp] = requestBodyToCreateFacilityLoanNonGbp;

    describe('creates a bundle information in ACBS with a transformation of the requested new loan', () => {
      it('uses GBP dependent fields when request currency is GBP', async () => {
        when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanGbp).mockReturnValueOnce(bondRepaymentSchedules);

        await service.createLoanForFacility(facilityIdentifier, newLoanGbp);

        expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoanGbp, idToken);
      });

      it('uses non-GBP dependent fields when request currency is not GBP', async () => {
        when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanNonGbp).mockReturnValueOnce(bondRepaymentSchedules);

        await service.createLoanForFacility(facilityIdentifier, newLoanNonGbp);

        expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoanNonGbp, idToken);
      });

      it('uses request issue date if request issue date is in the past', async () => {
        const dateBeforeToday = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
        const newLoanWithPastIssueDate = {
          ...newLoanGbp,
          issueDate: dateBeforeToday,
        };
        when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanWithPastIssueDate).mockReturnValueOnce(bondRepaymentSchedules);

        await service.createLoanForFacility(facilityIdentifier, newLoanWithPastIssueDate);

        expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoanGbp, idToken);
      });

      it('uses issue date as today if request issue date is in the future', async () => {
        const dateAfterToday = TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY;
        const newLoanWithFutureIssueDate = {
          ...newLoanGbp,
          issueDate: dateAfterToday,
        };
        const midnightToday = dateStringTransformations.getDateStringFromDate(new Date());
        const acbsRequestBodyToCreateFacilityLoanWithIssueDateAfterToday = {
          ...acbsRequestBodyToCreateFacilityLoanGbp,
          BundleMessageList: [
            {
              ...acbsRequestBodyToCreateFacilityLoanGbp.BundleMessageList[0],
              EffectiveDate: midnightToday,
              RateSettingDate: midnightToday,
            },
          ],
        };
        when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanWithFutureIssueDate).mockReturnValueOnce(bondRepaymentSchedules);

        await service.createLoanForFacility(facilityIdentifier, newLoanWithFutureIssueDate);

        expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoanWithIssueDateAfterToday, idToken);
      });

      it(`uses productTypeId as loanInstrumentCode if productTypeId is '250'`, async () => {
        const newLoanWithProductTypeId250 = {
          ...newLoanGbp,
          productTypeId: ENUMS.PRODUCT_TYPE_IDS.BSS,
        };
        const acbsRequestBodyToCreateFacilityLoanWithProductTypeId250 = {
          ...acbsRequestBodyToCreateFacilityLoanGbp,
          BundleMessageList: [
            {
              ...acbsRequestBodyToCreateFacilityLoanGbp.BundleMessageList[0],
              LoanInstrumentCode: ENUMS.PRODUCT_TYPE_IDS.BSS,
              ProductType: {
                ProductTypeCode: ENUMS.PRODUCT_TYPE_IDS.BSS,
              },
            },
          ],
        };
        when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanWithProductTypeId250).mockReturnValueOnce(bondRepaymentSchedules);

        await service.createLoanForFacility(facilityIdentifier, newLoanWithProductTypeId250);

        expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoanWithProductTypeId250, idToken);
      });

      it(`uses productTypeId as loanInstrumentCode if productTypeId is '260'`, async () => {
        const newLoanWithProductTypeId260 = {
          ...newLoanGbp,
          productTypeId: ENUMS.PRODUCT_TYPE_IDS.EWCS,
        };
        const acbsRequestBodyToCreateFacilityLoanWithProductTypeId260 = {
          ...acbsRequestBodyToCreateFacilityLoanGbp,
          BundleMessageList: [
            {
              ...acbsRequestBodyToCreateFacilityLoanGbp.BundleMessageList[0],
              LoanInstrumentCode: ENUMS.PRODUCT_TYPE_IDS.EWCS,
              ProductType: {
                ProductTypeCode: ENUMS.PRODUCT_TYPE_IDS.EWCS,
              },
            },
          ],
        };
        when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanWithProductTypeId260).mockReturnValueOnce(bondRepaymentSchedules);

        await service.createLoanForFacility(facilityIdentifier, newLoanWithProductTypeId260);

        expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoanWithProductTypeId260, idToken);
      });

      it(`uses productTypeId as loanInstrumentCode if productTypeId is '280'`, async () => {
        const newLoanWithProductTypeId280 = {
          ...newLoanGbp,
          productTypeId: ENUMS.PRODUCT_TYPE_IDS.GEF_CASH,
        };
        const acbsRequestBodyToCreateFacilityLoanWithProductTypeId280 = {
          ...acbsRequestBodyToCreateFacilityLoanGbp,
          BundleMessageList: [
            {
              ...acbsRequestBodyToCreateFacilityLoanGbp.BundleMessageList[0],
              LoanInstrumentCode: ENUMS.PRODUCT_TYPE_IDS.GEF_CASH,
              ProductType: {
                ProductTypeCode: ENUMS.PRODUCT_TYPE_IDS.GEF_CASH,
              },
            },
          ],
        };
        when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanWithProductTypeId280).mockReturnValueOnce(bondRepaymentSchedules);

        await service.createLoanForFacility(facilityIdentifier, newLoanWithProductTypeId280);

        expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoanWithProductTypeId280, idToken);
      });

      it(`sets loanInstrumentCode to '280' if productTypeId is '281'`, async () => {
        const newLoanWithProductTypeId281 = {
          ...newLoanGbp,
          productTypeId: ENUMS.PRODUCT_TYPE_IDS.GEF_CONTINGENT,
        };
        const acbsRequestBodyToCreateFacilityLoanWithProductTypeId281 = {
          ...acbsRequestBodyToCreateFacilityLoanGbp,
          BundleMessageList: [
            {
              ...acbsRequestBodyToCreateFacilityLoanGbp.BundleMessageList[0],
              LoanInstrumentCode: ENUMS.PRODUCT_TYPE_IDS.GEF_CASH,
              ProductType: {
                ProductTypeCode: ENUMS.PRODUCT_TYPE_IDS.GEF_CONTINGENT,
              },
            },
          ],
        };
        when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanWithProductTypeId281).mockReturnValueOnce(bondRepaymentSchedules);

        await service.createLoanForFacility(facilityIdentifier, newLoanWithProductTypeId281);

        expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(acbsRequestBodyToCreateFacilityLoanWithProductTypeId281, idToken);
      });
    });

    it('returns a bundle identifier from ACBS', async () => {
      when(repaymentScheduleBuilderGetRepaymentSchedules).calledWith(newLoanGbp).mockResolvedValueOnce(bondRepaymentSchedules);

      const response = await service.createLoanForFacility(facilityIdentifier, newLoanGbp);

      expect(response).toEqual({ bundleIdentifier });
    });
  });
});
