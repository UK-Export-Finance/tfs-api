import { ENUMS } from '@ukef/constants';
import { AcbsFacilityCovenantService } from '@ukef/modules/acbs/acbs-facility-covenant.service';
import { AcbsCreateFacilityCovenantRequestDto } from '@ukef/modules/acbs/dto/acbs-create-facility-covenant-request.dto';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { CreateFacilityCovenantGenerator } from '@ukef-test/support/generator/create-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DateStringTransformations } from '../date/date-string.transformations';
import { FacilityCovenantService } from './facility-covenant.service';

jest.mock('@ukef/modules/date/current-date.provider');
jest.mock('@ukef/modules/acbs/acbs-facility-covenant.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('FacilityCovenantService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const facilityIdentifier = valueGenerator.ukefId();
  const facilityTypeCode = valueGenerator.stringOfNumericCharacters();
  const limitKeyValue = valueGenerator.string();

  let service: FacilityCovenantService;

  let acbsFacilityCovenantServiceCreateCovenantForFacility: jest.Mock;

  beforeEach(() => {
    const acbsFacilityCovenantService = new AcbsFacilityCovenantService(null, null);
    acbsFacilityCovenantServiceCreateCovenantForFacility = jest.fn();
    acbsFacilityCovenantService.createCovenantForFacility = acbsFacilityCovenantServiceCreateCovenantForFacility;

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    const acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new FacilityCovenantService(acbsAuthenticationService, acbsFacilityCovenantService, dateStringTransformations);
  });

  describe('createCovenantForFacility', () => {
    const { acbsRequestBodyToCreateFacilityCovenant, requestBodyToCreateFacilityCovenant } = new CreateFacilityCovenantGenerator(
      valueGenerator,
      dateStringTransformations,
    ).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      facilityTypeCode,
      limitKeyValue,
    });

    const [newCovenantWithAllFields] = requestBodyToCreateFacilityCovenant;

    it('creates a covenant in ACBS with a transformation of the requested new covenant', async () => {
      await service.createCovenantForFacility(facilityIdentifier, facilityTypeCode, limitKeyValue, newCovenantWithAllFields);

      expect(acbsFacilityCovenantServiceCreateCovenantForFacility).toHaveBeenCalledWith(facilityIdentifier, acbsRequestBodyToCreateFacilityCovenant, idToken);
    });

    it(`sets the covenantName to 'CHARGEABLE AMOUNT' if the covenantType is '46'`, async () => {
      const newCovenantWithCovenantType46 = { ...newCovenantWithAllFields, covenantType: ENUMS.COVENANT_TYPE_CODES.CHARGEABLE_AMOUNT };

      await service.createCovenantForFacility(facilityIdentifier, facilityTypeCode, limitKeyValue, newCovenantWithCovenantType46);

      const covenantCreatedInAcbs = getCovenantCreatedInAcbs();

      expect(covenantCreatedInAcbs.CovenantName).toBe('CHARGEABLE AMOUNT');
    });

    it(`sets the covenantName to 'CHARGEABLE AMOUNT' if the covenantType is '47'`, async () => {
      const newCovenantWithCovenantType47 = { ...newCovenantWithAllFields, covenantType: ENUMS.COVENANT_TYPE_CODES.CHARGEABLE_AMOUNT_NOT_GBP };

      await service.createCovenantForFacility(facilityIdentifier, facilityTypeCode, limitKeyValue, newCovenantWithCovenantType47);

      const covenantCreatedInAcbs = getCovenantCreatedInAcbs();

      expect(covenantCreatedInAcbs.CovenantName).toBe('CHARGEABLE AMOUNT');
    });

    it(`sets the covenantName to 'AMOUNT OF SUPPORTED BOND' if the covenantType is '43' and the facilityTypeCode is '250'`, async () => {
      const newCovenantWithCovenantType43 = { ...newCovenantWithAllFields, covenantType: ENUMS.COVENANT_TYPE_CODES.UK_CONTRACT_VALUE };

      await service.createCovenantForFacility(facilityIdentifier, '250', limitKeyValue, newCovenantWithCovenantType43);

      const covenantCreatedInAcbs = getCovenantCreatedInAcbs();

      expect(covenantCreatedInAcbs.CovenantName).toBe('AMOUNT OF SUPPORTED BOND');
    });

    it(`sets the covenantName to 'AMOUNT OF SUPPORTED FACILITY' if the covenantType is '43' and the facilityTypeCode is '260'`, async () => {
      const newCovenantWithCovenantType43 = { ...newCovenantWithAllFields, covenantType: ENUMS.COVENANT_TYPE_CODES.UK_CONTRACT_VALUE };

      await service.createCovenantForFacility(facilityIdentifier, '260', limitKeyValue, newCovenantWithCovenantType43);

      const covenantCreatedInAcbs = getCovenantCreatedInAcbs();

      expect(covenantCreatedInAcbs.CovenantName).toBe('AMOUNT OF SUPPORTED FACILITY');
    });

    it(`sets the covenantName to 'AMOUNT OF SUPPORTED FACILITY' if the covenantType is '43' and the facilityTypeCode is '280'`, async () => {
      const newCovenantWithCovenantType43 = { ...newCovenantWithAllFields, covenantType: ENUMS.COVENANT_TYPE_CODES.UK_CONTRACT_VALUE };

      await service.createCovenantForFacility(facilityIdentifier, '280', limitKeyValue, newCovenantWithCovenantType43);

      const covenantCreatedInAcbs = getCovenantCreatedInAcbs();

      expect(covenantCreatedInAcbs.CovenantName).toBe('AMOUNT OF SUPPORTED FACILITY');
    });

    it(`sets the covenantName to the facilityTypeCode if the covenantType is '43' and the facilityTypeCode is not '250', '260', or '280'`, async () => {
      const newCovenantWithCovenantType43 = { ...newCovenantWithAllFields, covenantType: ENUMS.COVENANT_TYPE_CODES.UK_CONTRACT_VALUE };

      await service.createCovenantForFacility(facilityIdentifier, '270', limitKeyValue, newCovenantWithCovenantType43);

      const covenantCreatedInAcbs = getCovenantCreatedInAcbs();

      expect(covenantCreatedInAcbs.CovenantName).toBe('270');
    });

    const getCovenantCreatedInAcbs = (): AcbsCreateFacilityCovenantRequestDto => acbsFacilityCovenantServiceCreateCovenantForFacility.mock.calls[0][1];
  });
});
