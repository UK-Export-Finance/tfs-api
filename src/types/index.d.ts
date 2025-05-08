export interface ExternalServiceConfig {
  baseUrl: string;
  maxRedirects: number;
  timeout: number;
}

interface GiftValidationError {
  path: string[];
  message: string;
}

interface ValidationErrorResponse {
  entityName: string;
  index: number;
  message: string;
  status: number;
  type: string;
  validationErrors: GiftValidationError[];
}
