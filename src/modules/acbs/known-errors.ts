import { AxiosError } from 'axios';

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

export const getFacilityNotFoundKnownAcbsError = (facilityIdentifier: string): KnownError => ({
  caseInsensitiveSubstringToFind: 'Facility not found',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`, error);
  },
});
