export abstract class AcbsAuthenticationService {
  abstract getIdToken(): Promise<string>;
}
