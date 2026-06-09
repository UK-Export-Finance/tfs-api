import { ENUMS } from '@ukef/constants';
import { SUPPORTED_CURRENCIES } from '@ukef/constants/currencies.constant';
import { LOAN_RATE_INDEX } from '@ukef/constants/loan-rate-index.constant';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { AccrualScheduleBuilder } from './accrual-schedule.builder';

describe('AccrualScheduleBuilder', () => {
  const valueGenerator = new RandomValueGenerator();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const dateStringTransformations = new DateStringTransformations();
  const currentDateProvider = new CurrentDateProvider();

  let accrualScheduleBuilder: AccrualScheduleBuilder;

  beforeEach(() => {
    accrualScheduleBuilder = new AccrualScheduleBuilder(dateStringTransformations, currentDateProvider);
  });

  describe('getAccrualSchedules', () => {
    const {
      requestBodyToCreateFacilityLoanGbp,
      requestBodyToCreateFacilityLoanNonGbp,
      bondAndGefAccrualSchedulesGbp,
      ewcsAccrualSchedulesUsd,
      ewcsAccrualSchedulesGbp,
    } = new CreateFacilityLoanGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      bundleIdentifier,
    });
    const [newLoanGbp] = requestBodyToCreateFacilityLoanGbp;
    const [newLoanNonGbp] = requestBodyToCreateFacilityLoanNonGbp;

    it.each([
      { productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.BOND, expectedResult: bondAndGefAccrualSchedulesGbp },
      { productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.GEF, expectedResult: bondAndGefAccrualSchedulesGbp },
    ])('generates $productTypeGroup accrual schedule', ({ productTypeGroup, expectedResult }) => {
      const newLoanWithProductTypeGroup = {
        ...newLoanGbp,
        productTypeGroup: productTypeGroup,
      };
      const accrualSchedules = accrualScheduleBuilder.getAccrualSchedules(newLoanWithProductTypeGroup);

      expect(accrualSchedules).toEqual(expectedResult);
    });

    it('uses request issue date if request issue date is in the past', () => {
      const dateBeforeToday = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
      const newLoanWithPastIssueDate = {
        ...newLoanGbp,
        issueDate: dateBeforeToday,
      };
      const accrualSchedules = accrualScheduleBuilder.getAccrualSchedules(newLoanWithPastIssueDate);

      expect(accrualSchedules).toEqual(bondAndGefAccrualSchedulesGbp);
    });

    it('uses issue date as today if request issue date is in the future', () => {
      const dateAfterToday = TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY;
      const newLoanWithFutureIssueDate = {
        ...newLoanGbp,
        issueDate: dateAfterToday,
      };
      const midnightToday = dateStringTransformations.getDateStringFromDate(new Date());
      const accrualSchedulesWithIssueDateAfterToday = [
        {
          ...bondAndGefAccrualSchedulesGbp[0],
          EffectiveDate: midnightToday,
        },
      ];
      const accrualSchedules = accrualScheduleBuilder.getAccrualSchedules(newLoanWithFutureIssueDate);

      expect(accrualSchedules).toEqual(accrualSchedulesWithIssueDateAfterToday);
    });

    describe(`generates ewcs accrual schedules when product type is 'EWCS'`, () => {
      it(`with 'SON' loan rate index when currency is 'GBP'`, () => {
        const newLoanWithProductTypeGroupEwcsCurrencyGbp = {
          ...newLoanGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.EWCS,
        };

        const accrualSchedules = accrualScheduleBuilder.getAccrualSchedules(newLoanWithProductTypeGroupEwcsCurrencyGbp);

        expect(accrualSchedules).toEqual(ewcsAccrualSchedulesGbp);
      });

      it(`with 'ESTR' loan rate index and 'true' use observation shift indicator when currency is 'EUR'`, () => {
        const newLoanWithProductTypeGroupEwcsCurrencyEur = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.EWCS,
          currency: SUPPORTED_CURRENCIES.EUR,
        };
        const ewcsAccrualSchedulesEur = [
          {
            ...ewcsAccrualSchedulesGbp[0],
          },
          {
            ...ewcsAccrualSchedulesGbp[1],
            LoanRateIndex: {
              LoanRateIndexCode: LOAN_RATE_INDEX.EUR,
            },
            AccrualScheduleIBORDetails: {
              ...ewcsAccrualSchedulesGbp[1].AccrualScheduleIBORDetails,
              UseObservationShiftIndicator: true,
            },
          },
        ];

        const accrualSchedules = accrualScheduleBuilder.getAccrualSchedules(newLoanWithProductTypeGroupEwcsCurrencyEur);

        expect(accrualSchedules).toEqual(ewcsAccrualSchedulesEur);
      });

      it(`with 'TONAR' loan rate index when currency is 'JPY'`, () => {
        const newLoanWithProductTypeGroupEwcsCurrencyJpy = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.EWCS,
          currency: SUPPORTED_CURRENCIES.JPY,
        };
        const ewcsAccrualSchedulesJpy = [
          {
            ...ewcsAccrualSchedulesGbp[0],
          },
          {
            ...ewcsAccrualSchedulesGbp[1],
            LoanRateIndex: {
              LoanRateIndexCode: LOAN_RATE_INDEX.JPY,
            },
          },
        ];

        const accrualSchedules = accrualScheduleBuilder.getAccrualSchedules(newLoanWithProductTypeGroupEwcsCurrencyJpy);

        expect(accrualSchedules).toEqual(ewcsAccrualSchedulesJpy);
      });

      it(`with 'U3M' loan rate index when currency is 'USD'`, () => {
        const newLoanWithProductTypeGroupEwcsCurrencyUsd = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.EWCS,
          currency: SUPPORTED_CURRENCIES.USD,
        };

        const accrualSchedules = accrualScheduleBuilder.getAccrualSchedules(newLoanWithProductTypeGroupEwcsCurrencyUsd);

        expect(accrualSchedules).toEqual(ewcsAccrualSchedulesUsd);
      });
    });
  });
});
