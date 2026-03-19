import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';
import { of, throwError } from 'rxjs';

import { MdmCustomersResponse } from './dto/mdm-customers-response.dto';
import { MdmException } from './exception/mdm.exception';
import { MdmResourceNotFoundException } from './exception/mdm-resource-not-found.exception';
import { MdmService } from './mdm.service';

describe('MdmService', () => {
  const logger = new PinoLogger({});

  const valueGenerator = new RandomValueGenerator();
  const expectedApimHeaders = {
    [process.env.APIM_MDM_KEY]: process.env.APIM_MDM_VALUE,
  };

  let httpServiceGet: jest.Mock;
  let service: MdmService;

  beforeEach(() => {
    const httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    service = new MdmService(httpService, logger);
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

    const expectedHttpServiceGetArgs: [string, object] = ['/v1/customers', { headers: expectedApimHeaders, params: { partyUrn: partyUrnToSearch } }];

    it('returns the search results from sending a GET request to the MDM /v1/customers?partyUrn={partyUrn} endpoint', async () => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: customerSearchResults,
            status: HttpStatus.OK,
            statusText: 'OK',
          }),
        );

      const foundCustomers = await service.findCustomersByPartyUrn(partyUrnToSearch);

      expect(foundCustomers).toBe(customerSearchResults);
    });

    it('throws an MdmResourceNotFoundException if the request in APIM MDM fails with a 404 response', async () => {
      const axios404Error = new AxiosError();
      axios404Error.response = { data: valueGenerator.string(), status: 404, statusText: 'Not Found', headers: undefined, config: undefined };
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axios404Error));

      const findCustomersPromise = service.findCustomersByPartyUrn(partyUrnToSearch);

      await expect(findCustomersPromise).rejects.toBeInstanceOf(MdmResourceNotFoundException);
      await expect(findCustomersPromise).rejects.toThrow(
        `Failed to find customers with partyUrn ${partyUrnToSearch} in APIM MDM. The response status was 404 Not Found.`,
      );
      await expect(findCustomersPromise).rejects.toHaveProperty('innerError', axios404Error);
    });

    it('throws an MdmException that is not an MdmResourceNotFoundException if the request to APIM MDM fails with a 500 response', async () => {
      const axios500Error = new AxiosError();
      axios500Error.response = { data: valueGenerator.string(), status: 500, statusText: 'Internal Server Error', headers: undefined, config: undefined };
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axios500Error));

      const findCustomersPromise = service.findCustomersByPartyUrn(partyUrnToSearch);

      await expect(findCustomersPromise).rejects.not.toBeInstanceOf(MdmResourceNotFoundException);
      await expect(findCustomersPromise).rejects.toBeInstanceOf(MdmException);
      await expect(findCustomersPromise).rejects.toThrow(`Failed to find customers with partyUrn ${partyUrnToSearch} in APIM MDM.`);
      await expect(findCustomersPromise).rejects.toHaveProperty('innerError', axios500Error);
    });

    it('throws an MdmException that is not an MdmResourceNotFoundException if the request in APIM MDM fails with an AxiosError without a response', async () => {
      const axiosErrorWithoutResponse = new AxiosError();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => axiosErrorWithoutResponse));

      const findCustomersPromise = service.findCustomersByPartyUrn(partyUrnToSearch);

      await expect(findCustomersPromise).rejects.not.toBeInstanceOf(MdmResourceNotFoundException);
      await expect(findCustomersPromise).rejects.toBeInstanceOf(MdmException);
      await expect(findCustomersPromise).rejects.toThrow(`Failed to find customers with partyUrn ${partyUrnToSearch} in APIM MDM.`);
      await expect(findCustomersPromise).rejects.toHaveProperty('innerError', axiosErrorWithoutResponse);
    });

    it('throws an MdmException that is not an MdmResourceNotFoundException if the request in APIM MDM fails with a generic error', async () => {
      const error = new Error();
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(throwError(() => error));

      const findCustomersPromise = service.findCustomersByPartyUrn(partyUrnToSearch);

      await expect(findCustomersPromise).rejects.not.toBeInstanceOf(MdmResourceNotFoundException);
      await expect(findCustomersPromise).rejects.toBeInstanceOf(MdmException);
      await expect(findCustomersPromise).rejects.toThrow(`Failed to find customers with partyUrn ${partyUrnToSearch} in APIM MDM.`);
      await expect(findCustomersPromise).rejects.toHaveProperty('innerError', error);
    });
  });

  describe('getAllObligationSubtypesWithProductTypeCodes', () => {
    const expectedHttpServiceGetArgs: [string, object] = ['/v2/ods/obligation-subtypes/with-product-type-codes', { headers: expectedApimHeaders }];

    beforeEach(() => {
      when(httpServiceGet)
        .calledWith(...expectedHttpServiceGetArgs)
        .mockReturnValueOnce(
          of({
            data: EXAMPLES.MDM.OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES_RESPONSE_DATA,
            status: HttpStatus.OK,
            statusText: 'OK',
          }),
        );
    });

    it('should call httpService.get', async () => {
      // Act
      await service.getAllObligationSubtypesWithProductTypeCodes();

      // Assert
      expect(httpServiceGet).toHaveBeenCalledTimes(1);
      expect(httpServiceGet).toHaveBeenCalledWith(...expectedHttpServiceGetArgs);
    });

    describe('when httpService.get is successful', () => {
      it('should return the response from httpService.get', async () => {
        // Act
        const result = await service.getAllObligationSubtypesWithProductTypeCodes();

        // Assert
        expect(result).toEqual(EXAMPLES.MDM.OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES_RESPONSE_DATA);
      });
    });

    describe('when httpService.get returns an error', () => {
      const mockError = new Error('Mock error');

      beforeEach(() => {
        httpServiceGet.mockReset();

        when(httpServiceGet)
          .calledWith(...expectedHttpServiceGetArgs)
          .mockReturnValueOnce(throwError(() => mockError));
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.getAllObligationSubtypesWithProductTypeCodes();

        // Assert
        const expected = new Error('Error getting obligation subtypes with product type codes from APIM MDM', { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('getAllObligationSubtypesByProductTypeCode', () => {
    const allObligationSubtypes = EXAMPLES.MDM.OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES_RESPONSE_DATA;
    const { productTypeCode } = EXAMPLES.MDM.OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES.OST001;

    let mockGetAllObligationSubtypesWithProductTypeCodes: jest.Mock;

    beforeEach(() => {
      mockGetAllObligationSubtypesWithProductTypeCodes = jest.fn().mockResolvedValueOnce(allObligationSubtypes);
      service.getAllObligationSubtypesWithProductTypeCodes = mockGetAllObligationSubtypesWithProductTypeCodes;
    });

    it('should call getAllObligationSubtypesWithProductTypeCodes', async () => {
      // Act
      await service.getAllObligationSubtypesByProductTypeCode(productTypeCode);

      // Assert
      expect(mockGetAllObligationSubtypesWithProductTypeCodes).toHaveBeenCalledTimes(1);
    });

    it('should return all obligation subtypes matching the provided product type code', async () => {
      // Act
      const result = await service.getAllObligationSubtypesByProductTypeCode(productTypeCode);

      // Assert
      expect(result).toStrictEqual([EXAMPLES.MDM.OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES.OST001]);
    });

    describe('when getAllObligationSubtypesWithProductTypeCodes returns an error', () => {
      const mockError = new Error('Mock error');

      beforeEach(() => {
        mockGetAllObligationSubtypesWithProductTypeCodes = jest.fn().mockRejectedValueOnce(mockError);
        service.getAllObligationSubtypesWithProductTypeCodes = mockGetAllObligationSubtypesWithProductTypeCodes;
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.getAllObligationSubtypesByProductTypeCode(productTypeCode);

        // Assert
        const expected = new Error(`Error getting obligation subtypes by product type code ${productTypeCode} from APIM MDM`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
