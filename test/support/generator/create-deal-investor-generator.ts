import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AcbsCreateDealInvestorRequest } from '@ukef/modules/acbs/dto/acbs-create-deal-investor-request.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateDealInvestorRequest, CreateDealInvestorRequestItem } from '@ukef/modules/deal-investor/dto/create-deal-investor-request.dto';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateDealInvestorGenerator extends AbstractGenerator<CreateDealInvestorRequestItem, GenerateResult, GenerateOptions> {
  constructor(
    protected readonly valueGenerator: RandomValueGenerator,
    protected readonly currentDateProvider: CurrentDateProvider,
    protected readonly dateStringTransformations: DateStringTransformations,
  ) {
    super(valueGenerator);
  }

  protected generateValues(): CreateDealInvestorRequestItem {
    return {
      dealIdentifier: this.valueGenerator.ukefId(),
      lenderType: this.valueGenerator.string({ minLength: 0, maxLength: 3 }),
      effectiveDate: TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY,
      expiryDate: this.valueGenerator.dateOnlyString(),
      dealStatus: this.valueGenerator.string({ minLength: 0, maxLength: 1 }),
      currency: this.valueGenerator.string({ length: 3 }),
    };
  }

  protected transformRawValuesToGeneratedValues(values: CreateDealInvestorRequest, { dealIdentifier }: GenerateOptions): GenerateResult {
    const firstDealInvestor = values[0];

    const effectiveDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(firstDealInvestor.effectiveDate)),
    );
    const effectiveDateString = this.dateStringTransformations.getDateStringFromDate(effectiveDateTime);

    const expiryDateOnlyString = firstDealInvestor.expiryDate;
    const expirationDateString = expiryDateOnlyString
      ? this.dateStringTransformations.addTimeToDateOnlyString(expiryDateOnlyString)
      : PROPERTIES.DEAL_INVESTOR.DEFAULT.expirationDate;

    const acbsRequestBodyToCreateDealInvestor: AcbsCreateDealInvestorRequest = {
      SectionIdentifier: PROPERTIES.DEAL_INVESTOR.DEFAULT.sectionIdentifier,
      EffectiveDate: effectiveDateString,
      ExpirationDate: expirationDateString,
      IsExpirationDateMaximum: firstDealInvestor.expiryDate ? false : true,
      LenderType: {
        LenderTypeCode: firstDealInvestor.lenderType ?? PROPERTIES.DEAL_INVESTOR.DEFAULT.lenderType.lenderTypeCode,
      },
      InvolvedParty: {
        PartyIdentifier: PROPERTIES.DEAL_INVESTOR.DEFAULT.involvedParty.partyIdentifier,
      },
      Currency: {
        CurrencyCode: firstDealInvestor.currency,
      },
      CustomerAdvisedIndicator: PROPERTIES.DEAL_INVESTOR.DEFAULT.customerAdvisedIndicator,
      DealStatus: {
        DealStatusCode: firstDealInvestor.dealStatus ?? PROPERTIES.DEAL_INVESTOR.DEFAULT.dealStatus.dealStatusCode,
      },
      UserDefinedCode1: PROPERTIES.DEAL_INVESTOR.DEFAULT.userDefinedCode1,
      ContractPercentage: PROPERTIES.DEAL_INVESTOR.DEFAULT.contractPercentage,
      LimitRevolvingIndicator: PROPERTIES.DEAL_INVESTOR.DEFAULT.limitRevolvingIndicator,
    };

    const requestBodyToCreateDealInvestor = values.map((v, index) => ({
      dealIdentifier: index === 0 ? dealIdentifier : v.dealIdentifier,
      lenderType: v.lenderType,
      effectiveDate: v.effectiveDate,
      expiryDate: v.expiryDate,
      dealStatus: v.dealStatus,
      currency: v.currency,
    }));

    return {
      acbsRequestBodyToCreateDealInvestor,
      requestBodyToCreateDealInvestor,
    };
  }
}
interface GenerateOptions {
  dealIdentifier?: UkefId;
}

interface GenerateResult {
  acbsRequestBodyToCreateDealInvestor: AcbsCreateDealInvestorRequest;
  requestBodyToCreateDealInvestor: CreateDealInvestorRequest;
}
