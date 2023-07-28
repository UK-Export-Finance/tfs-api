export type WithWarningErrors<T> = {
  responseBody: T;
  warningErrors: string;
};
