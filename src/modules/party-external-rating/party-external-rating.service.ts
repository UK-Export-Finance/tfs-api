import { Injectable } from '@nestjs/common';
import { AcbsPartyExternalRatingService } from '@ukef/modules/acbs/acbs-party-external-rating.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { PartyExternalRating } from '@ukef/modules/party-external-rating/party-external-rating.interface';

@Injectable()
export class PartyExternalRatingService {
  constructor(private readonly acbsAuthenticationService: AcbsAuthenticationService, private readonly acbsService: AcbsPartyExternalRatingService) {}

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
}
