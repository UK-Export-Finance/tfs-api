import { HttpService } from '@nestjs/axios';
import { CreateFacilityGenerator } from '@ukef-test/support/generator/create-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { when } from 'jest-when';
import { of } from 'rxjs';
import { DateStringTransformations } from '../date/date-string.transformations';

import { AcbsHttpService } from './acbs-http.service';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

describe('AcbsHttpService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const randomPortfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.facilityId();

  let httpService: HttpService;
  let service: AcbsHttpService;

  let httpServicePut: jest.Mock;
  let httpServiceGet: jest.Mock;
  let httpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServiceGet = jest.fn();
    httpService.get = httpServiceGet;

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    httpServicePut = jest.fn();
    httpService.put = httpServicePut;

  });

  describe('getRequest', () => {

    const expectedHttpServiceGetArgs = [
      `/Portfolio/${randomPortfolioIdentifier}/Facility/${facilityIdentifier}`,
      {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${idToken}`
        },
      },
    ];

    const expectedHttpServiceGetArgsWithReturnException = [
      `/Portfolio/${randomPortfolioIdentifier}/Facility/${facilityIdentifier}`,
      {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${idToken}`,
          ReturnException: true
        },
      },
    ]

    it.each([
      { useReturnExceptionHeader: true, expectedHttpServiceArgs: expectedHttpServiceGetArgsWithReturnException, description: 'with the ReturnException header set to true' },
      { useReturnExceptionHeader: false, expectedHttpServiceArgs: expectedHttpServiceGetArgs, description: 'without the ReturnException header' }
    ])(`when useReturnExceptionHeader is ($useReturnExceptionHeader) sends a GET to ACBS to get a facility ($description)`, async ({ useReturnExceptionHeader, expectedHttpServiceArgs }) => {
      service = new AcbsHttpService({ baseUrl, useReturnExceptionHeader: useReturnExceptionHeader }, httpService);

      when(httpServiceGet)
        .calledWith(...expectedHttpServiceArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.get({
        path: `/Portfolio/${randomPortfolioIdentifier}/Facility/${facilityIdentifier}`,
        idToken: idToken,
        onError: createWrapAcbsHttpGetErrorCallback({ messageForUnknownError: '', knownErrors: [] }),
      });

      expect(httpServiceGet).toHaveBeenCalledTimes(1);
      expect(httpServiceGet).toHaveBeenCalledWith(...expectedHttpServiceArgs);
    });
  });

  describe('postRequest', () => {

    const { acbsCreateFacilityRequest: newFacility } = new CreateFacilityGenerator(valueGenerator, new DateStringTransformations()).generate({
      numberToGenerate: 1,
      facilityIdentifier,
    });
  
    const expectedHttpServicePostArgs = [
      `/Portfolio/${randomPortfolioIdentifier}/Facility`,
      newFacility,
      {
        baseURL: baseUrl,
        headers: { 
          Authorization: `Bearer ${idToken}`, 
          'Content-Type': 'application/json' 
        },
      },
    ];

    const expectedHttpServicePostArgsWithReturnException = [
      `/Portfolio/${randomPortfolioIdentifier}/Facility`,
      newFacility,
      {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${idToken}`,
          ReturnException: true,
          'Content-Type': 'application/json'
        },
      },
    ]

    it.each([
      { useReturnExceptionHeader: true, expectedHttpServiceArgs: expectedHttpServicePostArgsWithReturnException, description: 'with the ReturnException header set to true' },
      { useReturnExceptionHeader: false, expectedHttpServiceArgs: expectedHttpServicePostArgs, description: 'without the ReturnException header' }
    ])(`when useReturnExceptionHeader is ($useReturnExceptionHeader) sends a POST to ACBS to update a facility ($description)`, async ({ useReturnExceptionHeader, expectedHttpServiceArgs }) => {
      service = new AcbsHttpService({ baseUrl, useReturnExceptionHeader: useReturnExceptionHeader }, httpService);

      when(httpServicePost)
        .calledWith(...expectedHttpServiceArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.post({
        path: `/Portfolio/${randomPortfolioIdentifier}/Facility`,
        requestBody: newFacility,
        idToken: idToken,
        onError: createWrapAcbsHttpPostOrPutErrorCallback({ messageForUnknownError: '', knownErrors: [] }),
      });

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServiceArgs);
    });
  });

  describe('putRequest', () => {

    const { acbsUpdateFacilityRequest: updatedFacility } = new UpdateFacilityGenerator(valueGenerator, new DateStringTransformations()).generate({
      numberToGenerate: 1,
      facilityIdentifier,
    });

    const expectedHttpServicePutArgs = [
      `/Portfolio/${randomPortfolioIdentifier}/Facility/${facilityIdentifier}`,
      updatedFacility,
      {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
      },
    ];

    const expectedHttpServicePutArgsWithReturnException = [
      `/Portfolio/${randomPortfolioIdentifier}/Facility/${facilityIdentifier}`,
      updatedFacility,
      {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${idToken}`,
          ReturnException: true,
          'Content-Type': 'application/json'
        },
      },
    ]

    it.each([
      { useReturnExceptionHeader: true, expectedHttpServiceArgs: expectedHttpServicePutArgsWithReturnException, description: 'with the ReturnException header set to true' },
      { useReturnExceptionHeader: false, expectedHttpServiceArgs: expectedHttpServicePutArgs, description: 'without the ReturnException header' }
    ])(`when useReturnExceptionHeader is ($useReturnExceptionHeader) sends a PUT to ACBS to update a facility ($description)`, async ({ useReturnExceptionHeader, expectedHttpServiceArgs }) => {
      service = new AcbsHttpService({ baseUrl, useReturnExceptionHeader: useReturnExceptionHeader }, httpService);

      when(httpServicePut)
        .calledWith(...expectedHttpServiceArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 200,
            statusText: 'OK',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.put({
        path: `/Portfolio/${randomPortfolioIdentifier}/Facility/${facilityIdentifier}`,
        requestBody: updatedFacility,
        idToken: idToken,
        onError: createWrapAcbsHttpPostOrPutErrorCallback({ messageForUnknownError: '', knownErrors: [] }),
      });

      expect(httpServicePut).toHaveBeenCalledTimes(1);
      expect(httpServicePut).toHaveBeenCalledWith(...expectedHttpServiceArgs);
    });
  });
});
