import { AcbsGetPartyResponseDto } from '@ukef/modules/acbs/dto/acbs-get-party-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetPartyByIdentifierResponse } from '@ukef/modules/party/dto/get-party-by-response.dto';
import { Party } from '@ukef/modules/party/party.interface';

import { AbstractGenerator } from './abstract-generator';

export class PartyGenerator extends AbstractGenerator<PartyValues, GenerateResult, GenerateOptions> {
  private readonly transformations: DateStringTransformations = new DateStringTransformations();

  protected generateValues(): PartyValues {
    return {
      alternateIdentifier: this.valueGenerator.stringOfNumericCharacters(),
      industryClassification: this.valueGenerator.stringOfNumericCharacters(),
      name1: this.valueGenerator.string(),
      name2: this.valueGenerator.string(),
      name3: this.valueGenerator.string(),
      smeType: this.valueGenerator.stringOfNumericCharacters(),
      citizenshipClass: this.valueGenerator.stringOfNumericCharacters(),
      officerRiskDate: this.valueGenerator.date(),
      countryCode: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: PartyValues[], options: GenerateOptions): GenerateResult {
    const partiesInAcbs = values.map((v, index) => ({
      PartyAlternateIdentifier: this.getPartyAlternateIdentifier(v.alternateIdentifier, index, options.basePartyAlternateIdentifier),
      IndustryClassification: { IndustryClassificationCode: v.industryClassification },
      PartyName1: v.name1,
      PartyName2: v.name2,
      PartyName3: v.name3,
      MinorityClass: { MinorityClassCode: v.smeType },
      CitizenshipClass: { CitizenshipClassCode: v.citizenshipClass },
      OfficerRiskDate: v.officerRiskDate.toISOString(),
      PrimaryAddress: { Country: { CountryCode: v.countryCode } },
    }));

    const parties = values.map((v, index) => ({
      alternateIdentifier: this.getPartyAlternateIdentifier(v.alternateIdentifier, index, options.basePartyAlternateIdentifier),
      industryClassification: v.industryClassification,
      name1: v.name1,
      name2: v.name2,
      name3: v.name3,
      smeType: v.smeType,
      citizenshipClass: v.citizenshipClass,
      officerRiskDate: this.transformations.removeTime(v.officerRiskDate.toISOString()),
      countryCode: v.countryCode,
    }));

    const partiesFromApi = parties;

    return {
      partiesInAcbs,
      parties,
      partiesFromApi,
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
  officerRiskDate: Date;
  countryCode: string;
}

interface GenerateResult {
  partiesInAcbs: AcbsGetPartyResponseDto[];
  parties: Party[];
  partiesFromApi: GetPartyByIdentifierResponse[];
}

interface GenerateOptions {
  basePartyAlternateIdentifier?: string;
}
