import { ExecutionContext } from '@nestjs/common';

export type ExternalServiceConfig = {
  baseUrl: string;
  maxRedirects: number;
  timeout: number;
};

// @nestjs/common no longer re-exports HttpArgumentsHost directly, so derive it from ExecutionContext
export type HttpArgumentsHost = ReturnType<ExecutionContext['switchToHttp']>;

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
