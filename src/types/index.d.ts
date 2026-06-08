export interface ExternalServiceConfig {
  baseUrl: string;
  maxRedirects: number;
  timeout: number;
}

export interface GiftAmendmentBaseParams {
  amendmentType: AmendFacilityType;
  facilityId: UkefId;
  workPackageId: number;
}

interface GiftValidationError {
  path: string[];
  message: string;
}

export interface ValidationErrorResponse {
  entityName: string;
  index: number;
  message: string;
  status: number;
  type: string;
  validationErrors: GiftValidationError[];
}

export interface GiftFacilityCreationValidationStrippedPayload {
  overview: string;
  fixedFees: string[];
  obligations: string[];
}
