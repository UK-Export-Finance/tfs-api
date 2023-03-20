import { HttpService } from '@nestjs/axios';
import { PROPERTIES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsFacilityPartyService } from './acbs-facility-party.service';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityPartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const facilityIdentifier = valueGenerator.stringOfNumericCharacters();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;

  const sectionIdentifier = valueGenerator.stringOfNumericCharacters({ minLength: 1, maxLength: 2 });
  const facilityStatusCode = valueGenerator.character();
  const involvedPartyIdentifier = valueGenerator.stringOfNumericCharacters();
  const effectiveDate = valueGenerator.dateTimeString();
  const expirationDate = valueGenerator.dateTimeString();
  const lenderTypeCode = valueGenerator.stringOfNumericCharacters();
  const currencyCode = 'GBP';
  const limitAmount = valueGenerator.nonnegativeFloat();
  const customerAdvisedIndicator = valueGenerator.bool();
  const limitRevolvingIndicator = valueGenerator.bool();

  const newFacilityParty = {
    FacilityStatus: {
      FacilityStatusCode: facilityStatusCode,
    },
    InvolvedParty: {
      PartyIdentifier: involvedPartyIdentifier,
    },
    EffectiveDate: effectiveDate,
    ExpirationDate: expirationDate,
    LenderType: {
      LenderTypeCode: lenderTypeCode,
    },
    SectionIdentifier: sectionIdentifier,
    Currency: {
      CurrencyCode: currencyCode,
    },
    LimitAmount: limitAmount,
    CustomerAdvisedIndicator: customerAdvisedIndicator,
    LimitRevolvingIndicator: limitRevolvingIndicator,
  };

  let httpService: HttpService;
  let service: AcbsFacilityPartyService;

  let httpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsFacilityPartyService({ baseUrl }, httpService);
  });

  const expectedHttpServicePostArgs = [
    `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityParty`,
    newFacilityParty,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  describe('createPartyForFacility', () => {
    it('sends a POST to ACBS with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.createPartyForFacility(facilityIdentifier, newFacilityParty, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
    });

    it('throws an AcbsResourceNotFoundException if ACBS responds with a 400 that is a string containing "The facility not found"', async () => {
      const axiosError = new AxiosError();
      const errorString = 'The facility not found or the user does not have access to it.';
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForDealPromise = service.createPartyForFacility(facilityIdentifier, newFacilityParty, idToken);

      await expect(createGuaranteeForDealPromise).rejects.toBeInstanceOf(AcbsResourceNotFoundException);
      await expect(createGuaranteeForDealPromise).rejects.toThrow(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is a string that does not contain "The facility not found"', async () => {
      const axiosError = new AxiosError();
      const errorString = valueGenerator.string();
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForDealPromise = service.createPartyForFacility(facilityIdentifier, newFacilityParty, idToken);

      await expect(createGuaranteeForDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createGuaranteeForDealPromise).rejects.toThrow(`Failed to create a party for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('errorBody', errorString);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 that is not a string', async () => {
      const axiosError = new AxiosError();
      const errorBody = { errorMessage: valueGenerator.string() };
      axiosError.response = {
        data: errorBody,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForDealPromise = service.createPartyForFacility(facilityIdentifier, newFacilityParty, idToken);

      await expect(createGuaranteeForDealPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createGuaranteeForDealPromise).rejects.toThrow(`Failed to create a party for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('errorBody', JSON.stringify(errorBody));
    });

    it('throws an AcbsUnexpectedException if ACBS responds with an error code that is not 400', async () => {
      const axiosError = new AxiosError();
      const errorBody = { errorMessage: valueGenerator.string() };
      axiosError.response = {
        data: errorBody,
        status: 401,
        statusText: 'Unauthorized',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createGuaranteeForDealPromise = service.createPartyForFacility(facilityIdentifier, newFacilityParty, idToken);

      await expect(createGuaranteeForDealPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createGuaranteeForDealPromise).rejects.toThrow(`Failed to create a party for facility ${facilityIdentifier} in ACBS.`);
      await expect(createGuaranteeForDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
