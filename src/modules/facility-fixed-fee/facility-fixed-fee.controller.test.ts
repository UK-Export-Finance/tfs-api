import { BadRequestException } from '@nestjs/common';
import { ENUMS } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { FacilityFixedFeeController } from '@ukef/modules/facility-fixed-fee/facility-fixed-fee.controller';
import { FacilityFixedFeeService } from '@ukef/modules/facility-fixed-fee/facility-fixed-fee.service';
import { CreateFacilityFixedFeeGenerator } from '@ukef-test/support/generator/create-facility-fixed-fee-generator';
import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

describe('FacilityFixedFeeController', () => {
  const valueGenerator = new RandomValueGenerator();
  const portfolioIdentifier = valueGenerator.string();
  const facilityIdentifier = valueGenerator.facilityId();

  const { apiFacilityFixedFees: serviceFixedFees } = new GetFacilityFixedFeeGenerator(valueGenerator, new DateStringTransformations()).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

  let getFacilityFixedFeesService: jest.Mock;
  let createFacilityFixedFeesService: jest.Mock;
  let getFacilityByIdentifierFacilityService: jest.Mock;

  let controller: FacilityFixedFeeController;

  beforeEach(() => {
    const facilityFixedFeeService = new FacilityFixedFeeService(null, null, null, null);
    getFacilityFixedFeesService = jest.fn();
    createFacilityFixedFeesService = jest.fn();
    facilityFixedFeeService.getFixedFeesForFacility = getFacilityFixedFeesService;
    facilityFixedFeeService.createFixedFeeForFacility = createFacilityFixedFeesService;

    const facilityService = new FacilityService(null, null, null, null);
    getFacilityByIdentifierFacilityService = jest.fn();
    facilityService.getFacilityByIdentifier = getFacilityByIdentifierFacilityService;

    controller = new FacilityFixedFeeController(facilityFixedFeeService, facilityService);
  });

  describe('getFixedFeesForFacility', () => {
    it('returns the fixed fees from the service', async () => {
      when(getFacilityFixedFeesService).calledWith(facilityIdentifier).mockResolvedValueOnce(serviceFixedFees);

      const fixedFees = await controller.getFixedFeesForFacility({ facilityIdentifier });

      expect(fixedFees).toStrictEqual(serviceFixedFees);
    });
  });

  describe('createFixedFeeForFacility', () => {
    const facilityTypeCode = valueGenerator.enumValue(ENUMS.FACILITY_TYPE_IDS);
    const borrowerPartyIdentifier = valueGenerator.acbsPartyId();

    const { requestBodyToCreateFacilityFixedFee } = new CreateFacilityFixedFeeGenerator(valueGenerator, new DateStringTransformations()).generate({
      numberToGenerate: 1,
      facilityTypeCode,
      borrowerPartyIdentifier,
    });

    it('creates a fixed fee for the facility with the service from the request body', async () => {
      when(getFacilityByIdentifierFacilityService).calledWith(facilityIdentifier).mockResolvedValueOnce({
        productTypeId: facilityTypeCode,
        obligorPartyIdentifier: borrowerPartyIdentifier,
        facilityOverallStatus: 'A',
        facilityStageCode: '07',
      });

      await controller.createFixedFeeForFacility({ facilityIdentifier }, requestBodyToCreateFacilityFixedFee);

      expect(createFacilityFixedFeesService).toHaveBeenCalledWith(
        facilityIdentifier,
        borrowerPartyIdentifier,
        facilityTypeCode,
        requestBodyToCreateFacilityFixedFee[0],
      );
    });

    it('returns the facility identifier if creating the fixed fee succeeds', async () => {
      when(getFacilityByIdentifierFacilityService).calledWith(facilityIdentifier).mockResolvedValueOnce({
        productTypeId: facilityTypeCode,
        obligorPartyIdentifier: borrowerPartyIdentifier,
        facilityOverallStatus: 'A',
        facilityStageCode: '07',
      });

      const response = await controller.createFixedFeeForFacility({ facilityIdentifier }, requestBodyToCreateFacilityFixedFee);

      expect(response).toEqual({ facilityIdentifier });
    });

    it('returns activation error if the facility is not active', async () => {
      when(getFacilityByIdentifierFacilityService).calledWith(facilityIdentifier).mockResolvedValueOnce({
        facilityOverallStatus: 'D',
        facilityStageCode: '07',
      });

      const responsePromise = controller.createFixedFeeForFacility({ facilityIdentifier }, requestBodyToCreateFacilityFixedFee);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad Request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'Facility needs to be activated before Fee is created');
    });

    it('returns Facility not issued error if the facility is not active', async () => {
      when(getFacilityByIdentifierFacilityService).calledWith(facilityIdentifier).mockResolvedValueOnce({
        facilityOverallStatus: 'A',
        facilityStageCode: '06',
      });

      const responsePromise = controller.createFixedFeeForFacility({ facilityIdentifier }, requestBodyToCreateFacilityFixedFee);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow('Bad Request');
      await expect(responsePromise).rejects.toHaveProperty('response.error', 'Facility needs to be issued before Fee is created');
    });
  });
});
