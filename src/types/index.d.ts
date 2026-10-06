export type ExternalServiceConfig = {
  baseUrl: string;
  maxRedirects: number;
  timeout: number;
};

export type GiftAmendmentBaseParams = {
  amendmentType: AmendFacilityTypeConsumer;
  facilityId: UkefId;
  workPackageId: number;
};

type GiftValidationError = {
  path: string[];
  message: string;
};

export type ValidationErrorResponse = {
  entityName: string;
  index: number;
  message: string;
  status: number;
  type: string;
  validationErrors: GiftValidationError[];
};

export type GiftFacilityCreationValidationStrippedPayload = {
  overview: string;
  fixedFees: string[];
  obligations: string[];
};
