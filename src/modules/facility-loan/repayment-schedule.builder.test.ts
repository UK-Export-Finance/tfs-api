import { ENUMS } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { CURRENCIES } from '@ukef/constants/currencies.constant';
import { CALENDAR_IDENTIFIERS } from '@ukef/constants/calendar-identifiers.constant';
import { RepaymentScheduleBuilder } from './repayment-schedule.builder';

describe('FacilityLoanService', () => {
  const valueGenerator = new RandomValueGenerator();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const dateStringTransformations = new DateStringTransformations();

  let repaymentScheduleBuilder: RepaymentScheduleBuilder;

  beforeEach(() => {

    repaymentScheduleBuilder = new RepaymentScheduleBuilder(
      dateStringTransformations,
    );
  });

  describe('createRepaymentSchedulesForLoan', () => {
    const {
      requestBodyToCreateFacilityLoanGbp,
      requestBodyToCreateFacilityLoanNonGbp,
      bondRepaymentSchedulesGbp,
      ewcsRepaymentSchedulesGbp,
      gefRepaymentSchedulesGbp,
    } = new CreateFacilityLoanGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      bundleIdentifier,
    });
    const [newLoanGbp] = requestBodyToCreateFacilityLoanGbp;
    const [newLoanNonGbp] = requestBodyToCreateFacilityLoanNonGbp;

    describe('generates correct repayment schedules', () => {
      
      it(`productTypeGroup is 'BOND' and currency is 'GBP `, () => {
        const newLoanWithProductTypeGroupBondCurrencyGbp = {
          ...newLoanGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.BOND,
        };
        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupBondCurrencyGbp);

        expect(repaymentSchedules).toEqual(bondRepaymentSchedulesGbp);
      });

      it(`productTypeGroup is 'BOND' and currency is 'EUR `, () => {
        const newLoanWithProductTypeGroupBondCurrencyEur = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.BOND,
          currency: CURRENCIES.EUR,
        };
        const bondRepaymentSchedulesEur = [
          {
            ...bondRepaymentSchedulesGbp[0],
            BillingCalendar: {
              CalendarIdentifier: CALENDAR_IDENTIFIERS.EU,
            },
          },
        ];

        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupBondCurrencyEur);

        expect(repaymentSchedules).toEqual(bondRepaymentSchedulesEur);
      });

      it(`productTypeGroup is 'BOND' and currency is 'USD `, () => {
        const newLoanWithProductTypeGroupBondCurrencyUsd = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.BOND,
          currency: CURRENCIES.USD,
        };
        const bondRepaymentSchedulesUsd = [
          {
            ...bondRepaymentSchedulesGbp[0],
            BillingCalendar: {
              CalendarIdentifier: CALENDAR_IDENTIFIERS.US,
            },
          },
        ];

        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupBondCurrencyUsd);

        expect(repaymentSchedules).toEqual(bondRepaymentSchedulesUsd);
      });

      it(`productTypeGroup is 'GEF' and currency is 'GBP `, () => {
        const newLoanWithProductTypeGroupGefCurrencyGbp = {
          ...newLoanGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.GEF,
        };

        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupGefCurrencyGbp);

        expect(repaymentSchedules).toEqual(gefRepaymentSchedulesGbp);
      });

      it(`productTypeGroup is 'GEF' and currency is 'EUR `, () => {
        const newLoanWithProductTypeGroupGefCurrencyEur = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.GEF,
          currency: CURRENCIES.EUR,
        };
        const gefRepaymentSchedulesEur = [
          {
            ...gefRepaymentSchedulesGbp[0],
            BillingCalendar: {
              CalendarIdentifier: CALENDAR_IDENTIFIERS.EU,
            },
          },
        ];

        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupGefCurrencyEur);

        expect(repaymentSchedules).toEqual(gefRepaymentSchedulesEur);
      });

      it(`productTypeGroup is 'GEF' and currency is 'USD `, () => {
        const newLoanWithProductTypeGroupGefCurrencyUsd = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.GEF,
          currency: CURRENCIES.USD,
        };
        const gefRepaymentSchedulesUsd = [
          {
            ...gefRepaymentSchedulesGbp[0],
            BillingCalendar: {
              CalendarIdentifier: CALENDAR_IDENTIFIERS.US,
            },
          },
        ];

        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupGefCurrencyUsd);

        expect(repaymentSchedules).toEqual(gefRepaymentSchedulesUsd);
      });

      it(`productTypeGroup is 'EWCS' and currency is 'GBP `, () => {
        const newLoanWithProductTypeGroupEwcsCurrencyGbp = {
          ...newLoanGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.EWCS,
        };

        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupEwcsCurrencyGbp);

        expect(repaymentSchedules).toEqual(ewcsRepaymentSchedulesGbp);
      });

      it(`productTypeGroup is 'EWCS' and currency is 'EUR `, () => {
        const newLoanWithProductTypeGroupEwcsCurrencyEur = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.EWCS,
          currency: CURRENCIES.EUR,
        };
        const ewcsRepaymentSchedulesEur = [
          {
            ...ewcsRepaymentSchedulesGbp[0],
            BillingCalendar: {
              CalendarIdentifier: CALENDAR_IDENTIFIERS.EU,
            },
          },
          {
            ...ewcsRepaymentSchedulesGbp[1],
            BillingCalendar: {
              CalendarIdentifier: CALENDAR_IDENTIFIERS.EU,
            },
          },
        ];

        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupEwcsCurrencyEur);

        expect(repaymentSchedules).toEqual(ewcsRepaymentSchedulesEur);
      });

      it(`productTypeGroup is 'EWCS' and currency is 'USD `, () => {
        const newLoanWithProductTypeGroupEwcsCurrencyUsd = {
          ...newLoanNonGbp,
          productTypeGroup: ENUMS.PRODUCT_TYPE_GROUPS.EWCS,
          currency: CURRENCIES.USD,
        };
        const ewcsRepaymentSchedulesUsd = [
          {
            ...ewcsRepaymentSchedulesGbp[0],
            BillingCalendar: {
              CalendarIdentifier: CALENDAR_IDENTIFIERS.US,
            },
          },
          {
            ...ewcsRepaymentSchedulesGbp[1],
            BillingCalendar: {
              CalendarIdentifier: CALENDAR_IDENTIFIERS.US,
            },
          },
        ];

        const repaymentSchedules = repaymentScheduleBuilder.getRepaymentSchedules(newLoanWithProductTypeGroupEwcsCurrencyUsd);

        expect(repaymentSchedules).toEqual(ewcsRepaymentSchedulesUsd);
      });
    });
  });
});
