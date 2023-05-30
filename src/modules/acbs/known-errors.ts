import { AxiosError } from 'axios';

import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

export type KnownErrors = KnownError[];

type KnownError = { caseInsensitiveSubstringToFind: string; throwError: (error: AxiosError) => never };

export const getPartyNotFoundKnownAcbsError = (partyIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Party not found',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Party with identifier ${partyIdentifier} was not found by ACBS.`, error);
  },
});

export const getDealNotFoundKnownAcbsError = (dealIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'The deal not found',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Deal with identifier ${dealIdentifier} was not found by ACBS.`, error);
  },
});

export const facilityNotFoundKnownAcbsError = (facilityIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Facility not found',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`, error);
  },
});

export const postFacilityNotFoundKnownAcbsError = (facilityIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Facility does not exist',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`, error);
  },
});

export const postFixedFeeExistsKnownAcbsError = (): KnownError => ({
  caseInsensitiveSubstringToFind: 'FixedFee exists',
  throwError: (error) => {
    throw new AcbsBadRequestException('Bad request', error, 'Fixed fee with this period and lenderTypeCode combination already exists.');
  },
});

export const postInvalidPortfolioAndFacilityIdCombinationKnownAcbsError = (facilityIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Invalid PortfolioId and FacilityId combination.',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`, error);
  },
});

export const getBundleInformationNotFoundKnownAcbsError = (bundleIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'BundleInformation not found',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Bundle information with bundle identifier ${bundleIdentifier} was not found by ACBS.`, error);
  },
});

export const postPartyExternalRatingExistsKnownAcbsError = (): KnownError => ({
  caseInsensitiveSubstringToFind: 'PartyExternalRating exists',
  throwError: (error) => {
    throw new AcbsBadRequestException('Bad request', error, 'Party external rating with this assignedRatingCode and ratedDate combination already exists.');
  },
});

export const postPartyExternalRatingNotFoundKnownAcbsError = (partyIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'partyIdentifier is not valid',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Party with identifier ${partyIdentifier} was not found by ACBS.`, error);
  },
});

export const getLoanNotFoundKnownAcbsBundleInformationError = (loanIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Loan does not exist',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Loan with identifier ${loanIdentifier} was not found by ACBS.`, error);
  },
});
