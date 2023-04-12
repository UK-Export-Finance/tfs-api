import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';

export const getMockAcbsAuthenticationService = (): {
  service: AcbsAuthenticationService;
  getIdToken: jest.Mock;
} => {
  const getIdToken = jest.fn();
  return {
    service: new MockAcbsAuthenticationService(getIdToken),
    getIdToken,
  };
};

class MockAcbsAuthenticationService extends AcbsAuthenticationService {
  readonly getIdToken: () => Promise<string>;

  constructor(getIdToken: jest.Mock) {
    super();
    this.getIdToken = getIdToken;
  }
}
