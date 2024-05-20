import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AssignedRatingCodeEnum } from '@ukef/constants/enums/assigned-rating-code';
import { DateString } from '@ukef/helpers/date-string.type';
import { AcbsCreatePartyExternalRatingRequestDto } from '@ukef/modules/acbs/dto/acbs-create-party-external-rating-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreatePartyExternalRating } from '@ukef/modules/party-external-rating/create-party-external-rating.interface';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreatePartyExternalRatingGenerator extends AbstractGenerator<PartyExternalRatingValues, GenerateResult, GenerateOptions> {
  constructor(
    protected readonly valueGenerator: RandomValueGenerator,
    protected readonly dateStringTransformations: DateStringTransformations,
  ) {
    super(valueGenerator);
  }

  protected generateValues(): PartyExternalRatingValues {
    return {
      assignedRatingCode: this.valueGenerator.enumValue(ENUMS.ASSIGNED_RATING_CODES) as AssignedRatingCodeEnum,
      ratedDate: this.valueGenerator.dateOnlyString(),
    };
  }

  protected transformRawValuesToGeneratedValues(
    externalRatings: PartyExternalRatingValues[],
    { partyIdentifier, assignedRatingCode, ratedDate }: GenerateOptions,
  ): GenerateResult {
    const [firstExternalRating] = externalRatings;
    const ratedDateOnly = ratedDate ?? firstExternalRating.ratedDate;
    const ratedDateTime = this.dateStringTransformations.addTimeToDateOnlyString(ratedDateOnly);

    const acbsExternalRatingToCreate: AcbsCreatePartyExternalRatingRequestDto = {
      PartyIdentifier: partyIdentifier,
      RatingEntity: {
        RatingEntityCode: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.ratingEntityCode,
      },
      AssignedRating: {
        AssignedRatingCode: assignedRatingCode ?? firstExternalRating.assignedRatingCode,
      },
      RatedDate: ratedDateTime,
      ProbabilityofDefault: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.probabilityofDefault,
      LossGivenDefault: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.lossGivenDefault,
      RiskWeighting: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.riskWeighting,
      ExternalRatingNote1: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.externalRatingNote1,
      ExternalRatingNote2: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.externalRatingNote2,
    };

    const apiExternalRatingToCreate: CreatePartyExternalRating = {
      assignedRatingCode: assignedRatingCode ?? firstExternalRating.assignedRatingCode,
      ratedDate: ratedDateOnly,
    };

    return {
      acbsExternalRatingToCreate,
      apiExternalRatingToCreate,
    };
  }
}

interface PartyExternalRatingValues {
  assignedRatingCode: AssignedRatingCodeEnum;
  ratedDate: DateString;
}

interface GenerateOptions {
  partyIdentifier: string;
  assignedRatingCode?: AssignedRatingCodeEnum;
  ratedDate?: DateString;
}

interface GenerateResult {
  acbsExternalRatingToCreate: AcbsCreatePartyExternalRatingRequestDto;
  apiExternalRatingToCreate: CreatePartyExternalRating;
}
