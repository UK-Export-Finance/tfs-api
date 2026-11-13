import { HttpStatus } from '@nestjs/common';
import nock from 'nock';
import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { givenAuthenticationWithTheIdpSucceedsWith } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { CreateFacilityLoanAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-loan-amount-amendment.generator';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateLoanGenerator } from '@ukef-test/support/generator/update-loan-generator';

describe('Flexible Validation on ACBS Amendment Endpoints', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();
  const loanIdentifier = valueGenerator.loanId();
  const idToken = valueGenerator.string();
  const sessionId = valueGenerator.string();

  const { increaseAmountRequest } = new CreateFacilityLoanAmountAmendmentGenerator(valueGenerator, new DateStringTransformations()).generate({
    loanIdentifier,
    numberToGenerate: 1,
  });

  const { updateLoanExpiryDateRequest, acbsGetExistingLoanResponse, acbsUpdateLoanRequest } = new UpdateLoanGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
    loanIdentifier,
  });

  const givenRequestToGetAndUpdateLoanInAcbsSucceeds = () => {
    givenAuthenticationWithTheIdpSucceedsWith({ sessionId, idToken });
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Loan/${loanIdentifier}`)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(200, acbsGetExistingLoanResponse);
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .put(`/Portfolio/${portfolioIdentifier}/Loan/${loanIdentifier}`)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(200, acbsUpdateLoanRequest);
  };

  const updateExpiryDateUrl = `/api/v1/facilities/${facilityIdentifier}/loans/${loanIdentifier}`;
  const amountAmendmentUrl = `/api/v1/facilities/${facilityIdentifier}/loans/${loanIdentifier}/amendments/amount`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  describe('POST /facilities/{facilityIdentifier}/loans/{loanIdentifier}/amendments/amount', () => {
    describe('Extra fields handling', () => {
      it(`should NOT fail validation (${HttpStatus.BAD_REQUEST}) when extra fields are present`, async () => {
        // Arrange: create a request with extra fields
        // The key test: extra fields should NOT trigger forbidNonWhitelisted validation error
        // Send request with extra fields that should be stripped
        const requestWithExtraFields = [
          {
            ...increaseAmountRequest[0],
            // Extra fields that should be stripped
            extraField1: 'should be stripped',
            extraField2: 12345,
            extraField3: { nested: 'should be stripped' },
          },
        ];

        // Act
        const response = await api.post(amountAmendmentUrl, requestWithExtraFields);

        // Assert
        // The critical assertion: it should NOT be "property...should not exist"
        // which would indicate forbidNonWhitelisted is true (it should be false)
        const message = Array.isArray(response.body.message) ? response.body.message.join(', ') : response.body.message;
        expect(message).not.toContain('should not exist');
      });

      it(`should still validate required fields are present (${HttpStatus.BAD_REQUEST})`, async () => {
        // Arrange: Send request missing required amountAmendment field
        const requestWithoutRequired = [
          {
            effectiveDate: '2026-11-12',
            // amountAmendment is missing - required field
            extraField1: 'extra',
          },
        ];

        // Act
        const response = await api.post(amountAmendmentUrl, requestWithoutRequired);

        // Assert: Should fail validation for missing required field
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(Array.isArray(response.body.message) || typeof response.body.message === 'string').toBe(true);
      });

      it(`should validate amountAmendment type even with extra fields (${HttpStatus.BAD_REQUEST})`, async () => {
        // Arrange:Send request with invalid amountAmendment type
        const requestWithInvalidType = [
          {
            effectiveDate: '2026-11-12',
            amountAmendment: 'not a number', // Invalid - should be number
            extraField1: 'extra',
          },
        ];

        // Act
        const response = await api.post(amountAmendmentUrl, requestWithInvalidType);

        // Assert: Should fail type validation
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should validate amountAmendment cannot be zero (${HttpStatus.BAD_REQUEST})`, async () => {
        // Send request with zero amountAmendment (forbidden by forbidZero constraint)
        const requestWithZeroAmount = [
          {
            effectiveDate: '2026-11-12',
            amountAmendment: 0, // Zero not allowed
            extraField1: 'extra',
          },
        ];

        // Act
        const response = await api.post(amountAmendmentUrl, requestWithZeroAmount);

        // Assert: Should fail validation
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe('PATCH /facilities/{facilityIdentifier}/loans/{loanIdentifier}', () => {
    describe('Extra fields handling', () => {
      it(`should NOT fail validation (${HttpStatus.OK}) when extra fields are present`, async () => {
        // Arrange: a valid request with extra fields that should be stripped, not rejected,
        // by the global forbidNonWhitelisted validation.
        givenRequestToGetAndUpdateLoanInAcbsSucceeds();
        const requestWithExtraFields = {
          ...updateLoanExpiryDateRequest,
          extraField1: 'should be stripped',
          extraField2: 12345,
        };

        // Act
        const response = await api.patch(updateExpiryDateUrl, requestWithExtraFields);

        // Assert: the critical check is that extra fields do not trigger the global
        // forbidNonWhitelisted validation error (which would produce a 400 containing
        // "should not exist" and never reach the controller/ACBS).
        expect(response.status).toBe(HttpStatus.OK);
      });

      it(`should validate that required expiryDate is still enforced (${HttpStatus.BAD_REQUEST})`, async () => {
        // Arrange: Send request missing required expiryDate field
        const requestWithoutRequired = {
          // expiryDate is missing - required field
          extraField1: 'extra',
        };

        // Act
        const response = await api.patch(updateExpiryDateUrl, requestWithoutRequired);

        // Assert: Should fail validation for missing required field
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(Array.isArray(response.body.message) || typeof response.body.message === 'string').toBe(true);
      });

      it(`should validate expiryDate format is correct even with extra fields (${HttpStatus.BAD_REQUEST})`, async () => {
        // Arrange: Send request with invalid expiryDate format
        const requestWithInvalidDate = {
          expiryDate: 'not-a-valid-date', // Invalid date format
          extraField1: 'extra',
        };

        // Act
        const response = await api.patch(updateExpiryDateUrl, requestWithInvalidDate);

        // Assert: Should fail format validation
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should validate expiryDate ISO 8601 format with extra fields (${HttpStatus.BAD_REQUEST})`, async () => {
        // Arrange: Send request with wrong date format (needs YYYY-MM-DD format)
        const requestWithWrongFormat = {
          expiryDate: '31-12-2027', // Wrong format
          extraField1: 'extra',
        };

        // Act
        const response = await api.patch(updateExpiryDateUrl, requestWithWrongFormat);

        // Assert: Should fail format validation
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
    });
  });

  describe('Validation strictness maintained', () => {
    it('should NOT error on extra fields (forbidNonWhitelisted should be false)', async () => {
      // Arrange
      // This is the KEY test: verify extra fields don't cause "should not exist" errors
      const requestWithManyExtraFields = [
        {
          ...increaseAmountRequest[0],
          extra1: 'value',
          extra2: 123,
          extra3: { complex: 'object' },
        },
      ];

      // Act
      const response = await api.post(amountAmendmentUrl, requestWithManyExtraFields);

      // Assert
      // The critical check: response should succeed or not contain "should not exist"
      // because forbidNonWhitelisted should be false (flexible validation)
      const messageText = Array.isArray(response.body.message) ? response.body.message.join(' ') : response.body.message;

      expect(messageText).not.toContain('should not exist');
    });
  });
});
