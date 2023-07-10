import nock from 'nock';

import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_MDM_TIMEOUT } from './environment-variables';

export class MockMdmApi {
  constructor(private readonly nockInstance: typeof nock) {}

  requestToFindCustomersByPartyUrn(partyUrn: string): MdmApiRequestInterceptor {
    const nockInterceptor = this.buildInterceptorForGetCustomersEndpoint().query({ partyUrn });
    return new MdmApiRequestInterceptor(nockInterceptor);
  }

  requestToFindCustomersByAnyPartyUrn(): MdmApiRequestInterceptor {
    const nockInterceptor = this.buildInterceptorForGetCustomersEndpoint().query(
      ({ partyUrn, ...otherQueryParams }) => !!partyUrn && Object.keys(otherQueryParams).length === 0,
    );
    return new MdmApiRequestInterceptor(nockInterceptor);
  }

  private buildInterceptorForGetCustomersEndpoint(): nock.Interceptor {
    return this.nockInstance(ENVIRONMENT_VARIABLES.APIM_MDM_URL)
      .get('/customers')
      .matchHeader(ENVIRONMENT_VARIABLES.APIM_MDM_KEY, ENVIRONMENT_VARIABLES.APIM_MDM_VALUE);
  }
}

class MdmApiRequestInterceptor {
  constructor(private readonly nockInterceptor: nock.Interceptor) {}

  respondsWith(responseCode: number, responseBody?: nock.Body): nock.Scope {
    return this.nockInterceptor.reply(responseCode, responseBody);
  }

  timesOutWith(responseCode: number, responseBody: nock.Body): nock.Scope {
    return this.nockInterceptor.delay(TIME_EXCEEDING_MDM_TIMEOUT).reply(responseCode, responseBody);
  }
}
