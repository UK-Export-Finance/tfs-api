import { HttpService } from '@nestjs/axios';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { MdmCustomersResponse } from './dto/mdm-customers-response.dto';
import { MdmException } from './exception/mdm.exception';
import { MdmResourceNotFoundException } from './exception/mdm-resource-not-found.exception';
import { MdmService } from './mdm.service';

describe('MdmService', () => {
  const valueGenerator = new RandomValueGenerator();

  let httpServiceGet: jest.Mock;
  let service: MdmService;

  beforeEach(() => {
    const httpService = new HttpService();
    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new MdmService(httpService);
  });

  describe('findCustomersByPartyUrn', () => {
    const partyUrnToSearch = valueGenerator.ukefPartyId();
    const customerSearchResults: MdmCustomersResponse = [
      {
        type: null,
      },
      {
        type: valueGenerator.string(),
      },
      {
        type: valueGenerator.string(),
      },
    ];

    const expectedHttpServiceGetArgs: [string, object] = ['/customers', { headers: {}, params: { partyUrn: partyUrnToSearch } }];

    it('returns the search results from sending a GET request to the MDM /customers?partyUrn={partyUrn} endpoint', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: customerSearchResults,
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      const foundCustomers = await service.findCustomersByPartyUrn(partyUrnToSearch);

      expect(foundCustomers).toBe(customerSearchResults);
    });

    it('throws an MdmResourceNotFoundException if the request to MDM fails with a 404 response', async () => {
      const axios404Error = new AxiosError();
      axios404Error.response = { data: valueGenerator.string(), status: 404, statusText: 'Not Found', headers: undefined, config: undefined };
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axios404Error));

      const findCustomersPromise = service.findCustomersByPartyUrn(partyUrnToSearch);

      await expect(findCustomersPromise).rejects.toBeInstanceOf(MdmResourceNotFoundException);
      await expect(findCustomersPromise).rejects.toThrow(
        `Failed to find customers with partyUrn ${partyUrnToSearch} in MDM. The response status was 404 Not Found.`,
      );
      await expect(findCustomersPromise).rejects.toHaveProperty('innerError', axios404Error);
    });

    it('throws an MdmException that is not an MdmResourceNotFoundException if the request to MDM fails with a 500 response', async () => {
      const axios500Error = new AxiosError();
      axios500Error.response = { data: valueGenerator.string(), status: 500, statusText: 'Internal Server Error', headers: undefined, config: undefined };
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axios500Error));

      const findCustomersPromise = service.findCustomersByPartyUrn(partyUrnToSearch);

      await expect(findCustomersPromise).rejects.not.toBeInstanceOf(MdmResourceNotFoundException);
      await expect(findCustomersPromise).rejects.toBeInstanceOf(MdmException);
      await expect(findCustomersPromise).rejects.toThrow(`Failed to find customers with partyUrn ${partyUrnToSearch} in MDM.`);
      await expect(findCustomersPromise).rejects.toHaveProperty('innerError', axios500Error);
    });

    it('throws an MdmException that is not an MdmResourceNotFoundException if the request to MDM fails with an AxiosError without a response', async () => {
      const axiosErrorWithoutResponse = new AxiosError();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axiosErrorWithoutResponse));

      const findCustomersPromise = service.findCustomersByPartyUrn(partyUrnToSearch);

      await expect(findCustomersPromise).rejects.not.toBeInstanceOf(MdmResourceNotFoundException);
      await expect(findCustomersPromise).rejects.toBeInstanceOf(MdmException);
      await expect(findCustomersPromise).rejects.toThrow(`Failed to find customers with partyUrn ${partyUrnToSearch} in MDM.`);
      await expect(findCustomersPromise).rejects.toHaveProperty('innerError', axiosErrorWithoutResponse);
    });

    it('throws an MdmException that is not an MdmResourceNotFoundException if the request to MDM fails with a generic error', async () => {
      const error = new Error();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => error));

      const findCustomersPromise = service.findCustomersByPartyUrn(partyUrnToSearch);

      await expect(findCustomersPromise).rejects.not.toBeInstanceOf(MdmResourceNotFoundException);
      await expect(findCustomersPromise).rejects.toBeInstanceOf(MdmException);
      await expect(findCustomersPromise).rejects.toThrow(`Failed to find customers with partyUrn ${partyUrnToSearch} in MDM.`);
      await expect(findCustomersPromise).rejects.toHaveProperty('innerError', error);
    });
  });
});
