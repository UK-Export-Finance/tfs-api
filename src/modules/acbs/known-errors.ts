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

export const postFixedFeeExistsAcbsError = (): KnownError => ({
  caseInsensitiveSubstringToFind: 'FixedFee exists',
  throwError: (error) => {
    throw new AcbsBadRequestException('Bad request', error, 'Fixed fee with this period and lenderTypeCode combination already exist.');
  },
});

export const postInvalidPortfolioAndFacilityIdCombinationKnownAcbsError = (facilityIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Invalid PortfolioId and FacilityId combination.',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`, error);
  },
});

export const postFixedFeeExistsAcbsError = (): KnownError => ({
  caseInsensitiveSubstringToFind: 'FixedFee exists',
  throwError: (error) => {
    throw new AcbsBadRequestException('Bad request', error, 'Fixed fee with this period and lenderTypeCode combination already exist.');
  },
});

export const postInvalidPortfolioAndFacilityIdCombinationKnownAcbsError = (facilityIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Invalid PortfolioId and FacilityId combination.',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`, error);
  },
});

export const getBundleInformationNotFoundKnownAcbsError = (bundleIdentifier: string, actionName: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'BundleInformation not found',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`${actionName} with bundle identifier ${bundleIdentifier} was not found by ACBS.`, error);
  },
});

export const getLoanNotFoundKnownAcbsBundleInformationError = (loanIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Loan does not exist',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Loan with identifier ${loanIdentifier} was not found by ACBS.`, error);
  },
});
