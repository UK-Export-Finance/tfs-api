import { ENUMS } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityService } from '@ukef/modules/acbs/acbs-facility.service';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { FacilityAmountTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-amount-transaction.bundle-action';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { UpdateFacilityBundleIdentifierResponse } from '@ukef/modules/facility/dto/update-facility-response.dto';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { withUpdateFacilityServiceGeneralTests } from '@ukef/modules/facility/facility.service.update-facility.test-parts/update-facility-service-general-tests';
import { UpdateFacilityServiceTestPartsArgs } from '@ukef/modules/facility/facility.service.update-facility.test-parts/update-facility-service-test-parts-args.interface';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { when } from 'jest-when';

describe('FacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();

  const expectedResult = { bundleIdentifier };

  const amendAmountByIdentifier = (updateFacilityRequest: UpdateFacilityRequest): Promise<UpdateFacilityBundleIdentifierResponse> =>
    service.amendFacilityAmountByIdentifier(facilityIdentifier, updateFacilityRequest);

  let acbsBundleInformationServiceCreateBundleInformation: jest.Mock;
  let acbsFacilityServiceUpdateFacilityByIdentifier: jest.Mock;
  let acbsFacilityServiceGetFacilityByIdentifier: jest.Mock;
  let service: FacilityService;

  beforeEach(() => {
    acbsFacilityServiceUpdateFacilityByIdentifier = jest.fn();
    const acbsFacilityService = new AcbsFacilityService(null, null);
    acbsFacilityService.updateFacilityByIdentifier = acbsFacilityServiceUpdateFacilityByIdentifier;

    acbsBundleInformationServiceCreateBundleInformation = jest.fn();
    const acbsBundleInformationService = new AcbsBundleInformationService(null, null);
    acbsBundleInformationService.createBundleInformation = acbsBundleInformationServiceCreateBundleInformation;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    acbsFacilityServiceGetFacilityByIdentifier = jest.fn();
    acbsFacilityService.getFacilityByIdentifier = acbsFacilityServiceGetFacilityByIdentifier;

    service = new FacilityService(
      acbsAuthenticationService,
      acbsBundleInformationService,
      acbsFacilityService,
      dateStringTransformations,
      new CurrentDateProvider(),
    );
  });

  const { updateFacilityRequest, acbsGetExistingFacilityResponse, acbsBundleInformationRequest } = new UpdateFacilityGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({ numberToGenerate: 1, facilityIdentifier });

  describe('amendFacilityAmountByIdentifier', () => {
    it.each([
      { newTransactionValue: 100, oldTransactionValue: 200, expectedTypeCode: ENUMS.FACILITY_TRANSACTION_TYPE_CODES.MINUS, description: 'less than' },
      { newTransactionValue: 200, oldTransactionValue: 100, expectedTypeCode: ENUMS.FACILITY_TRANSACTION_TYPE_CODES.PLUS, description: 'more than' },
      { newTransactionValue: 100, oldTransactionValue: 100, expectedTypeCode: ENUMS.FACILITY_TRANSACTION_TYPE_CODES.MINUS, description: 'equal to' },
    ])(
      'creates bundle information with a typecode of $expectedTypeCode if newTransactionValue is $description oldTransactionValue',
      async ({ newTransactionValue, oldTransactionValue, expectedTypeCode }) => {
        const modifiedUpdateFacilityRequest = { ...updateFacilityRequest, maximumLiability: newTransactionValue };
        const modifiedGetFacilityRequest = { ...acbsGetExistingFacilityResponse, LimitAmount: oldTransactionValue };
        getAcbsGetFacilityRequestCalledCorrectlyMock().mockResolvedValueOnce(modifiedGetFacilityRequest);
        acbsBundleInformationServiceCreateBundleInformation.mockResolvedValueOnce({ BundleIdentifier: bundleIdentifier });

        await amendAmountByIdentifier(modifiedUpdateFacilityRequest);

        expectAcbsCreateBundleInformationToBeCalledOnceWith(
          expect.objectContaining({
            BundleMessageList: expect.arrayContaining([expect.objectContaining({ FacilityTransactionType: { TypeCode: expectedTypeCode } })]),
          }),
        );
      },
    );

    it.each([
      { newTransactionValue: 100, oldTransactionValue: 200, expectedTransactionAmount: 100 },
      { newTransactionValue: 200, oldTransactionValue: 100, expectedTransactionAmount: 100 },
      { newTransactionValue: 0, oldTransactionValue: 0, expectedTransactionAmount: 0 },
    ])(
      'creates bundle information with a transaction amount as the absolute value of newTransactionValue - oldTransactionValue',
      async ({ newTransactionValue, oldTransactionValue, expectedTransactionAmount }) => {
        const modifiedUpdateFacilityRequest = { ...updateFacilityRequest, maximumLiability: newTransactionValue };
        const modifiedAcbsGetExistingFacilityResponse = { ...acbsGetExistingFacilityResponse, LimitAmount: oldTransactionValue };

        getAcbsGetFacilityRequestCalledCorrectlyMock().mockResolvedValueOnce(modifiedAcbsGetExistingFacilityResponse);
        acbsBundleInformationServiceCreateBundleInformation.mockResolvedValueOnce({ BundleIdentifier: bundleIdentifier });

        await amendAmountByIdentifier(modifiedUpdateFacilityRequest);

        expectAcbsCreateBundleInformationToBeCalledOnceWith(
          expect.objectContaining({
            BundleMessageList: expect.arrayContaining([expect.objectContaining({ TransactionAmount: expectedTransactionAmount })]),
          }),
        );
      },
    );

    const testArgs: UpdateFacilityServiceTestPartsArgs<AcbsCreateBundleInformationRequestDto<FacilityAmountTransaction>> = {
      valueGenerator,
      updateFacilityRequest,
      acbsGetExistingFacilityResponse,
      expectedAcbsUpdateMethodRequest: acbsBundleInformationRequest,
      expectedResult,
      updateFacility: amendAmountByIdentifier,
      expectAcbsUpdateMethodToBeCalledOnceWith: (bundleInformationToCreateInAcbs) =>
        expectAcbsCreateBundleInformationToBeCalledOnceWith(bundleInformationToCreateInAcbs),
      getAcbsGetFacilityRequestCalledCorrectlyMock: () => getAcbsGetFacilityRequestCalledCorrectlyMock(),
      getAcbsFacilityServiceGetFacilityByIdentifierMock: () => getAcbsFacilityServiceGetFacilityByIdentifierMock(),
      getAcbsUpdateMethodMock: () => getAcbsBundleInformationServiceCreateBundleInformationMock(),
      mockSuccessfulAcbsUpdateMethod: () => mockSuccessfulAcbsCreateBundleInformation(acbsBundleInformationRequest),
    };

    withUpdateFacilityServiceGeneralTests(testArgs);

    const getAcbsFacilityServiceGetFacilityByIdentifierMock = () => acbsFacilityServiceGetFacilityByIdentifier;
    const getAcbsBundleInformationServiceCreateBundleInformationMock = () => acbsBundleInformationServiceCreateBundleInformation;

    const getAcbsGetFacilityRequestCalledCorrectlyMock = () => when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken);

    const mockSuccessfulAcbsCreateBundleInformation = (acbsBundleInformationRequest: AcbsCreateBundleInformationRequestDto<FacilityAmountTransaction>) =>
      when(acbsBundleInformationServiceCreateBundleInformation)
        .calledWith(acbsBundleInformationRequest, idToken)
        .mockReturnValueOnce({ BundleIdentifier: bundleIdentifier });

    const expectAcbsCreateBundleInformationToBeCalledOnceWith = (
      bundleInformationToCreateInAcbs: AcbsCreateBundleInformationRequestDto<FacilityAmountTransaction>,
    ) => {
      expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledWith(bundleInformationToCreateInAcbs, idToken);
      expect(acbsBundleInformationServiceCreateBundleInformation).toHaveBeenCalledTimes(1);
    };
  });
});
