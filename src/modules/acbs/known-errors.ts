import { AxiosError } from 'axios';

import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

export type KnownErrors = KnownError[];

type KnownError = { substringToFind: string; throwError: (error: AxiosError) => never };

export const getPartyNotFoundKnownAcbsError = (partyIdentifier: string): KnownError => ({
  substringToFind: 'Party not found',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Party with identifier ${partyIdentifier} was not found by ACBS.`, error);
  },
});

export const getDealNotFoundKnownAcbsError = (dealIdentifier: string): KnownError => ({
  substringToFind: 'The deal not found',
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Deal with identifier ${dealIdentifier} was not found by ACBS.`, error);
  },
});

export const getFacilityNotFoundKnownAcbsError = (facilityIdentifier: string): KnownError => ({
  substringToFind: 'acility not found', // This is used because ACBS uses the wording 'Facility not found...' for some endpoints and 'The facility not found...' for others.
  throwError: (error) => {
    throw new AcbsResourceNotFoundException(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`, error);
  },
});
