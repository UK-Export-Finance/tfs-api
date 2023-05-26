import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityLoanService } from '@ukef/modules/acbs/acbs-facility-loan.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateLoanGenerator } from '@ukef-test/support/generator/update-loan-generator';
import { when } from 'jest-when';

import { AcbsLoanService } from '../acbs/acbs-loan-service';
import { AcbsGetLoanByLoanIdentifierResponseDto } from '../acbs/dto/acbs-get-loan-by-loan-identifier-response.dto';
import { AcbsException } from '../acbs/exception/acbs.exception';
import { UpdateLoanExpiryDateRequest } from './dto/update-loan-expiry-date-request.dto';
import { FacilityLoanService } from './facility-loan.service';

describe('FacilityLoanService', () => {
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const loanIdentifier = valueGenerator.loanId();
  const dateStringTransformations = new DateStringTransformations();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityLoanService;
  let acbsFacilityLoanService: AcbsFacilityLoanService;
  let acbsBundleInformationService: AcbsBundleInformationService;
  let acbsLoanService: AcbsLoanService;

  let acbsFacilityLoanServiceGetLoansForFacility: jest.Mock;
  let acbsLoanServiceUpdateLoanByIdentifier: jest.Mock;
  let acbsLoanServiceGetLoanByIdentifier: jest.Mock;

  const { acbsUpdateLoanRequest, updateLoanExpiryDateRequest, acbsGetExistingLoanResponse } = new UpdateLoanGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
    loanIdentifier,
  });

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    acbsFacilityLoanService = new AcbsFacilityLoanService(null, null);

    acbsFacilityLoanServiceGetLoansForFacility = jest.fn();
    acbsFacilityLoanService.getLoansForFacility = acbsFacilityLoanServiceGetLoansForFacility;

    acbsLoanService = new AcbsLoanService(null, null);

    acbsLoanServiceUpdateLoanByIdentifier = jest.fn();
    acbsLoanService.updateLoanByIdentifier = acbsLoanServiceUpdateLoanByIdentifier;

    acbsLoanServiceGetLoanByIdentifier = jest.fn();
    acbsLoanService.getLoanByIdentifier = acbsLoanServiceGetLoanByIdentifier;

    service = new FacilityLoanService(
      acbsAuthenticationService,
      acbsFacilityLoanService,
      acbsBundleInformationService,
      new DateStringTransformations(),
      new CurrentDateProvider(),
      null,
      acbsLoanService,
    );
  });

  describe('updateLoanExpiryDate', () => {
    const mockSuccessfulAcbsGetLoanRequestWithResponse = (response: AcbsGetLoanByLoanIdentifierResponseDto) => {
      when(acbsLoanServiceGetLoanByIdentifier).calledWith(portfolioIdentifier, loanIdentifier, idToken).mockResolvedValueOnce(response);
    };
    const mockUnsuccessfulAcbsGetLoanRequest = () => {
      when(acbsLoanServiceGetLoanByIdentifier)
        .calledWith(portfolioIdentifier, loanIdentifier, idToken)
        .mockRejectedValue(new AcbsException(`Failed to update loan with identifier ${loanIdentifier} in ACBS.`));
    };

    const makeUpdateLoanExpiryDateRequestWithRequest = async (updateLoanExpiryDateRequest: UpdateLoanExpiryDateRequest) => {
      await service.updateLoanExpiryDate(loanIdentifier, updateLoanExpiryDateRequest);
    };

    const getRequestsAndResponsesWithKnownDateParameters = ({
      includeFinancialNextValuationDate,
      includeCustomerUsageNextValuationDate,
    }: {
      includeFinancialNextValuationDate: boolean;
      includeCustomerUsageNextValuationDate: boolean;
    }) => {
      const modifiedNewExpiryDate = valueGenerator.dateOnlyString();
      const modifiedExistingDate = valueGenerator.dateTimeString();
      const modifiedUpdateLoanExpiryDateRequest = { ...updateLoanExpiryDateRequest, expiryDate: modifiedNewExpiryDate };
      const modifiedAcbsGetExistingLoanResponse = {
        ...acbsGetExistingLoanResponse,
        MaturityDate: modifiedExistingDate,
        RateMaturityDate: modifiedExistingDate,
        ...(includeFinancialNextValuationDate && { FinancialNextValuationDate: modifiedExistingDate }),
        ...(includeCustomerUsageNextValuationDate && { CustomerUsageNextValuationDate: modifiedExistingDate }),
      };
      const modifiedAcbsUpdateLoanRequest = {
        ...acbsUpdateLoanRequest,
        MaturityDate: dateStringTransformations.addTimeToDateOnlyString(modifiedNewExpiryDate),
        RateMaturityDate: dateStringTransformations.addTimeToDateOnlyString(modifiedNewExpiryDate),
        ...(includeFinancialNextValuationDate && { FinancialNextValuationDate: dateStringTransformations.addTimeToDateOnlyString(modifiedNewExpiryDate) }),
        ...(includeCustomerUsageNextValuationDate && {
          CustomerUsageNextValuationDate: dateStringTransformations.addTimeToDateOnlyString(modifiedNewExpiryDate),
        }),
      };

      return { modifiedUpdateLoanExpiryDateRequest, modifiedAcbsGetExistingLoanResponse, modifiedAcbsUpdateLoanRequest };
    };

    it('does not call ACBS update loan service if ACBS get loan service does not return a 200', async () => {
      mockUnsuccessfulAcbsGetLoanRequest();

      const updateLoanExpiryDateResponse = makeUpdateLoanExpiryDateRequestWithRequest(updateLoanExpiryDateRequest);

      await expect(updateLoanExpiryDateResponse).rejects.toBeInstanceOf(AcbsException);
      expect(acbsLoanServiceUpdateLoanByIdentifier).toHaveBeenCalledTimes(0);
    });

    describe.each([
      {
        description: 'updates maturityDate and rateMaturityDate to the new expiry date',
        requestsAndResponses: getRequestsAndResponsesWithKnownDateParameters({
          includeFinancialNextValuationDate: false,
          includeCustomerUsageNextValuationDate: false,
        }),
      },
      {
        description: 'updates financialNextValuationDate to the new expiry date if financialNextValuationDate present on existing loan',
        requestsAndResponses: getRequestsAndResponsesWithKnownDateParameters({
          includeFinancialNextValuationDate: true,
          includeCustomerUsageNextValuationDate: false,
        }),
      },
      {
        description: 'updates customerUsageNextValuationDate to the new expiry date if customerUsageNextValuationDate present on existing loan',
        requestsAndResponses: getRequestsAndResponsesWithKnownDateParameters({
          includeFinancialNextValuationDate: false,
          includeCustomerUsageNextValuationDate: true,
        }),
      },
      {
        description:
          'updates both financialNextValuationDate and customerUsageNextValuationDate to the new expiry date if both financialNextValuationDate and customerUsageNextValuationDate present on existing loan',
        requestsAndResponses: getRequestsAndResponsesWithKnownDateParameters({
          includeFinancialNextValuationDate: true,
          includeCustomerUsageNextValuationDate: true,
        }),
      },
    ])('updates a loan in ACBS with the expected request', ({ description, requestsAndResponses }) => {
      it(`${description}`, async () => {
        const { modifiedUpdateLoanExpiryDateRequest, modifiedAcbsGetExistingLoanResponse, modifiedAcbsUpdateLoanRequest } = requestsAndResponses;
        mockSuccessfulAcbsGetLoanRequestWithResponse(modifiedAcbsGetExistingLoanResponse);

        await makeUpdateLoanExpiryDateRequestWithRequest(modifiedUpdateLoanExpiryDateRequest);

        expect(acbsLoanServiceUpdateLoanByIdentifier).toHaveBeenCalledWith(portfolioIdentifier, modifiedAcbsUpdateLoanRequest, idToken);
      });
    });
  });
});
