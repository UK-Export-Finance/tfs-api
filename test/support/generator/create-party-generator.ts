import { PROPERTIES } from '@ukef/constants';
import { DateString } from '@ukef/helpers/date-string.type';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { AcbsCreatePartyRequest } from '@ukef/modules/party/dto/acbs-create-party-request.dto';
import { CreatePartyRequest } from '@ukef/modules/party/dto/create-party-request.dto';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreatePartyGenerator extends AbstractGenerator<PartyValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): PartyValues {
    return {
      alternateIdentifier: this.valueGenerator.stringOfNumericCharacters({ length: 8 }),
      industryClassification: this.valueGenerator.stringOfNumericCharacters({ minLength: 1, maxLength: 10 }),
      name1: this.valueGenerator.string({ minLength: 1, maxLength: 35 }),
      name2: this.valueGenerator.string({ minLength: 0, maxLength: 35 }),
      name3: this.valueGenerator.string({ minLength: 0, maxLength: 35 }),
      smeType: this.valueGenerator.stringOfNumericCharacters({ minLength: 1, maxLength: 2 }),
      citizenshipClass: this.valueGenerator.integer({ min: 1, max: 2 }).toString(),
      officerRiskDate: this.valueGenerator.date().toISOString().split('T')[0],
      countryCode: this.valueGenerator.string({ minLength: 0, maxLength: 3 }),
    };
  }

  protected transformRawValuesToGeneratedValues(values: PartyValues[], options: GenerateOptions): GenerateResult {
    const firstParty = values[0];

    const acbsCreatePartyRequest: AcbsCreatePartyRequest = {
      PartyAlternateIdentifier: this.getPartyAlternateIdentifier(firstParty.alternateIdentifier, 0, options.basePartyAlternateIdentifier),
      IndustryClassification: {
        IndustryClassificationCode: firstParty.industryClassification,
      },
      PartyName1: firstParty.name1,
      PartyName2: firstParty.name2,
      PartyName3: firstParty.name3,
      PartyShortName: firstParty.name1.substring(0, 15),
      PartySortName: firstParty.name1.substring(0, 20),
      PartyType: {
        PartyTypeCode: PROPERTIES.PARTY.DEFAULT.partyTypeCode,
      },
      PrimaryAddress: {
        AddressIdentifier: PROPERTIES.PARTY.DEFAULT.address.addressIdentifier,
        AddressName1: PROPERTIES.PARTY.DEFAULT.address.addressName1,
        AddressType: {
          AddressTypeCode: PROPERTIES.PARTY.DEFAULT.address.addressTypeCode,
        },
        Country: {
          CountryCode: firstParty.countryCode,
        },
      },
      DefaultGeneralLedgerUnit: {
        GeneralLedgerUnitIdentifier: PROPERTIES.PARTY.DEFAULT.generalLedgerUnitIdentifier,
      },
      CitizenshipClass: {
        CitizenshipClassCode: firstParty.citizenshipClass,
      },
      OfficerRiskDate: this.dateStringTransformations.addTimeToDateOnlyString(firstParty.officerRiskDate),
      RiskRating: {
        RiskRatingCode: PROPERTIES.PARTY.DEFAULT.riskRatingCode,
      },
      PrimaryOfficer: {
        LineOfficerIdentifier: PROPERTIES.PARTY.DEFAULT.lineOfficerIdentifier,
      },
      SecondaryOfficer: {
        LineOfficerIdentifier: PROPERTIES.PARTY.DEFAULT.lineOfficerIdentifier,
      },
      ServicingUnitSection: {
        ServicingUnitSectionIdentifier: PROPERTIES.PARTY.DEFAULT.servicingUnitSectionIdentifier,
      },
      ServicingUnit: {
        ServicingUnitIdentifier: PROPERTIES.PARTY.DEFAULT.servicingUnitIdentifier,
      },
      PartyUserDefinedList1: {
        PartyUserDefinedList1Code: PROPERTIES.PARTY.DEFAULT.partyUserDefinedList1Code,
      },
      PartyUserDefinedList2: {
        PartyUserDefinedList2Code: PROPERTIES.PARTY.DEFAULT.partyUserDefinedList2Code,
      },
      PartyUserDefinedList3: {
        PartyUserDefinedList3Code: PROPERTIES.PARTY.DEFAULT.partyUserDefinedList3Code,
      },
      MinorityClass: {
        MinorityClassCode: firstParty.smeType,
      },
      PartyStatus: {
        PartyStatusCode: PROPERTIES.PARTY.DEFAULT.partyStatusCode,
      },
      DefaultLanguage: {
        LanguageCode: PROPERTIES.PARTY.DEFAULT.languageCode,
      },
      WatchListReason: {
        WatchListReasonCode: PROPERTIES.PARTY.DEFAULT.watchListReasonCode ?? '',
      },
    };

    const createPartyRequest: CreatePartyRequest = values.map((v, index) => ({
      alternateIdentifier: this.getPartyAlternateIdentifier(v.alternateIdentifier, index, options.basePartyAlternateIdentifier),
      industryClassification: v.industryClassification,
      name1: v.name1,
      name2: v.name2,
      name3: v.name3,
      smeType: v.smeType,
      citizenshipClass: v.citizenshipClass,
      officerRiskDate: v.officerRiskDate,
      countryCode: v.countryCode,
    }));

    return {
      acbsCreatePartyRequest,
      createPartyRequest,
    };
  }

  private getPartyAlternateIdentifier(candidateValue: string, partyIndex: number, basePartyAlternateIdentifier?: string): string {
    if (basePartyAlternateIdentifier === undefined) {
      return candidateValue;
    }

    return `${basePartyAlternateIdentifier}${partyIndex}`;
  }
}

interface PartyValues {
  alternateIdentifier: string;
  industryClassification: string;
  name1: string;
  name2: string;
  name3: string;
  smeType: string;
  citizenshipClass: string;
  officerRiskDate: DateString;
  countryCode: string;
}

interface GenerateResult {
  acbsCreatePartyRequest: AcbsCreatePartyRequest;
  createPartyRequest: CreatePartyRequest;
}

interface GenerateOptions {
  basePartyAlternateIdentifier?: string;
}
