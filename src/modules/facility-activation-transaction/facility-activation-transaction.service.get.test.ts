import { BadRequestException } from '@nestjs/common';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/get-facility-activation-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { FacilityActivationTransactionService } from './facility-activation-transaction.service';

describe('FacilityActivationTransactionService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();

  const { acbsFacilityActivationTransaction, apiFacilityActivationTransaction: expectedActivationTransaction } = new GetFacilityActivationTransactionGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 1, facilityIdentifier });

  let acbsAuthenticationService: AcbsAuthenticationService;
  let service: FacilityActivationTransactionService;

  let getBundleInformationAcbsService: jest.Mock;

  beforeEach(() => {
    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const acbsService = new AcbsBundleInformationService(null, null);
    getBundleInformationAcbsService = jest.fn();
    acbsService.getBundleInformationByIdentifier = getBundleInformationAcbsService;

    service = new FacilityActivationTransactionService(acbsAuthenticationService, acbsService, new DateStringTransformations());
  });

  describe('getActivationTransactionByBundleIdentifier', () => {
    it('returns a transformation of the activation transaction from ACBS', async () => {
      when(getBundleInformationAcbsService)
        .calledWith(bundleIdentifier, 'Activation transaction', idToken)
        .mockResolvedValueOnce(acbsFacilityActivationTransaction);

      const activationTransaction = await service.getActivationTransactionByBundleIdentifier(bundleIdentifier);

      expect(activationTransaction).toStrictEqual(expectedActivationTransaction);
    });

    it('throws a BadRequestException if the 0th element of the bundle message list is NOT a new code value transaction', async () => {
      const invalidActivationTransactionInAcbs = JSON.parse(JSON.stringify(acbsFacilityActivationTransaction));
      invalidActivationTransactionInAcbs.BundleMessageList.unshift({
        $type: 'AccrualScheduleAmountTransaction',
      });

      when(getBundleInformationAcbsService)
        .calledWith(bundleIdentifier, 'Activation transaction', idToken)
        .mockResolvedValueOnce(invalidActivationTransactionInAcbs);

      const responsePromise = service.getActivationTransactionByBundleIdentifier(bundleIdentifier);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'The provided bundleIdentifier does not correspond to an activation transaction.');
    });
  });
});
