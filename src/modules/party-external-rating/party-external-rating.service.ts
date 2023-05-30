import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsPartyExternalRatingService } from '@ukef/modules/acbs/acbs-party-external-rating.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { PartyExternalRating } from '@ukef/modules/party-external-rating/party-external-rating.interface';

import { DateStringTransformations } from '../date/date-string.transformations';
import { CreatePartyExternalRatingRequestDto } from './dto/create-party-external-rating-request.dto';

@Injectable()
export class PartyExternalRatingService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsService: AcbsPartyExternalRatingService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getExternalRatingsForParty(partyIdentifier: string): Promise<PartyExternalRating[]> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const externalRatingsInAcbs = await this.acbsService.getExternalRatingsForParty(partyIdentifier, idToken);
    return externalRatingsInAcbs.map((rating) => ({
      partyIdentifier: rating.PartyIdentifier,
      ratingEntity: {
        ratingEntityCode: rating.RatingEntity.RatingEntityCode,
      },
      assignedRating: {
        assignedRatingCode: rating.AssignedRating.AssignedRatingCode,
      },
      ratedDate: rating.RatedDate,
      probabilityofDefault: rating.ProbabilityofDefault,
      lossGivenDefault: rating.LossGivenDefault,
      riskWeighting: rating.RiskWeighting,
      externalRatingNote1: rating.ExternalRatingNote1,
      externalRatingNote2: rating.ExternalRatingNote2,
      externalRatingUserCode1: rating.ExternalRatingUserCode1.UserCode1,
      externalRatingUserCode2: rating.ExternalRatingUserCode2.UserCode2,
    }));
  }

  async createExternalRatingForParty(partyIdentifier: string, createPartyExternalRatingRequest: CreatePartyExternalRatingRequestDto): Promise<void> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const { assignedRatingCode, ratedDate } = createPartyExternalRatingRequest;
    const ratedDateTime = this.dateStringTransformations.addTimeToDateOnlyString(ratedDate);

    const acbsCreateExternalRatingRequest = {
      PartyIdentifier: partyIdentifier,
      RatingEntity: {
        RatingEntityCode: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.ratingEntityCode,
      },
      AssignedRating: {
        AssignedRatingCode: assignedRatingCode,
      },
      RatedDate: ratedDateTime,
      ProbabilityofDefault: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.probabilityofDefault,
      LossGivenDefault: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.lossGivenDefault,
      RiskWeighting: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.riskWeighting,
      ExternalRatingNote1: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.externalRatingNote1,
      ExternalRatingNote2: PROPERTIES.PARTY_EXTERNAL_RATING.DEFAULT.externalRatingNote2,
    };

    await this.acbsService.createExternalRatingForParty(acbsCreateExternalRatingRequest, idToken);
  }
}
