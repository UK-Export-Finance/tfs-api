import { AcbsBaseFacilityGuarantee } from './base-entities/acbs-base-facility-guarantee.interface';

export type AcbsGetFacilityGuaranteesResponseDto = AcbsGetFacilityGuaranteeDto[];

export type AcbsGetFacilityGuaranteeDto = Pick<
  AcbsBaseFacilityGuarantee,
  'EffectiveDate' | 'GuarantorParty' | 'LimitKey' | 'ExpirationDate' | 'GuaranteedLimit' | 'GuaranteeType'
>;
