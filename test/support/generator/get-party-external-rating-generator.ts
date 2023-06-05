import { DateString } from '@ukef/helpers/date-string.type';
import { AcbsGetPartyExternalRatingsResponseDto } from '@ukef/modules/acbs/dto/acbs-get-party-external-ratings-response.dto';
import { GetPartyExternalRatingsResponseDto } from '@ukef/modules/party-external-rating/dto/get-party-external-ratings-response.dto';
import { GetPartyExternalRating } from '@ukef/modules/party-external-rating/get-party-external-rating.interface';

import { AbstractGenerator } from './abstract-generator';

export class GetPartyExternalRatingGenerator extends AbstractGenerator<PartyExternalRatingValues, GenerateResult, GenerateOptions> {
  protected generateValues(): PartyExternalRatingValues {
    return {
      ratingEntityCode: this.valueGenerator.stringOfNumericCharacters(),
      assignedRatingCode: this.valueGenerator.stringOfNumericCharacters(),
      ratedDate: this.valueGenerator.date().toISOString(),
      probabilityofDefault: this.valueGenerator.probabilityFloat(),
      lossGivenDefault: this.valueGenerator.nonnegativeFloat(),
      riskWeighting: this.valueGenerator.nonnegativeFloat(),
      externalRatingNote1: this.valueGenerator.string(),
      externalRatingNote2: this.valueGenerator.string(),
      externalRatingUserCode1: this.valueGenerator.string(),
      externalRatingUserCode2: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: PartyExternalRatingValues[], { partyIdentifier }: GenerateOptions): GenerateResult {
    const externalRatingsInAcbs: AcbsGetPartyExternalRatingsResponseDto = values.map((v) => ({
      PartyIdentifier: partyIdentifier,
      RatingEntity: {
        RatingEntityCode: v.ratingEntityCode,
      },
      AssignedRating: {
        AssignedRatingCode: v.assignedRatingCode,
      },
      RatedDate: v.ratedDate,
      ProbabilityofDefault: v.probabilityofDefault,
      LossGivenDefault: v.lossGivenDefault,
      RiskWeighting: v.riskWeighting,
      ExternalRatingNote1: v.externalRatingNote1,
      ExternalRatingNote2: v.externalRatingNote2,
      ExternalRatingUserCode1: {
        UserCode1: v.externalRatingUserCode1,
      },
      ExternalRatingUserCode2: {
        UserCode2: v.externalRatingUserCode2,
      },
    }));

    const externalRatings: GetPartyExternalRating[] = values.map((v) => ({
      partyIdentifier: partyIdentifier,
      ratingEntity: {
        ratingEntityCode: v.ratingEntityCode,
      },
      assignedRating: {
        assignedRatingCode: v.assignedRatingCode,
      },
      ratedDate: v.ratedDate,
      probabilityofDefault: v.probabilityofDefault,
      lossGivenDefault: v.lossGivenDefault,
      riskWeighting: v.riskWeighting,
      externalRatingNote1: v.externalRatingNote1,
      externalRatingNote2: v.externalRatingNote2,
      externalRatingUserCode1: v.externalRatingUserCode1,
      externalRatingUserCode2: v.externalRatingUserCode2,
    }));

    const externalRatingsFromApi: GetPartyExternalRatingsResponseDto = externalRatings;

    return {
      acbsExternalRatings: externalRatingsInAcbs,
      externalRatings,
      apiExternalRatings: externalRatingsFromApi,
    };
  }
}

interface PartyExternalRatingValues {
  ratingEntityCode: string;
  assignedRatingCode: string;
  ratedDate: DateString;
  probabilityofDefault: number;
  lossGivenDefault: number;
  riskWeighting: number;
  externalRatingNote1: string;
  externalRatingNote2: string;
  externalRatingUserCode1: string;
  externalRatingUserCode2: string;
}

interface GenerateOptions {
  partyIdentifier: string;
}

interface GenerateResult {
  acbsExternalRatings: AcbsGetPartyExternalRatingsResponseDto;
  externalRatings: GetPartyExternalRating[];
  apiExternalRatings: GetPartyExternalRatingsResponseDto;
}
