import { EXAMPLES } from '@ukef/constants';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { mockResponse200, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import {
  generateArrayOfErrors,
  generateCounterpartySharePercentageErrors,
  generateHighLevelErrors,
  generateObligationSubtypeCodeErrors,
  generateOverviewErrors,
  getObligationSubtypeCodes,
  mapEntitiesByField,
  stripPayload,
} from '../helpers';
import { GiftCounterpartyService, GiftCurrencyService, GiftFeeTypeService, GiftProductTypeService } from '.';
import { GiftFacilityAsyncValidationService } from './gift.facility-async-validation.service';

const {
  GIFT: {
    COUNTERPARTY_ROLES_RESPONSE_DATA,
    CURRENCIES,
    FACILITY_CREATION_PAYLOAD: mockBasePayload,
    FACILITY_CREATION_PAYLOAD_NO_FIXED_FEES,
    FACILITY_ID: mockFacilityId,
    OBLIGATION,
  },
  MDM: { OBLIGATION_SUBTYPES_RESPONSE_DATA },
} = EXAMPLES;

const mockCounterpartyRoleCodes = [COUNTERPARTY_ROLES_RESPONSE_DATA.counterpartyRoles[0].code];

const mockObligationSubtypes = OBLIGATION_SUBTYPES_RESPONSE_DATA;

const mockError = mockResponse500();

describe('GiftFacilityAsyncValidationService', () => {
  const logger = new PinoLogger({});

  let counterpartyService: GiftCounterpartyService;
  let currencyService: GiftCurrencyService;
  let feeTypeService: GiftFeeTypeService;
  let productTypeService: GiftProductTypeService;
  let mdmService: MdmService;
  let service: GiftFacilityAsyncValidationService;

  let giftHttpService;
  let httpService;
  let mockGetSupportedCurrencies: jest.Mock;
  let mockGetAllFeeTypeCodes: jest.Mock;
  let mockProductTypeIsSupported: jest.Mock;
  let mockGetAllRoles: jest.Mock;
  let mockGetAllRoleCodes: jest.Mock;
  let mockGetAllSubtypesByProductTypeCode: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockGetAllRoles = jest.fn().mockResolvedValueOnce({ data: COUNTERPARTY_ROLES_RESPONSE_DATA });
    mockGetAllRoleCodes = jest.fn().mockReturnValueOnce(mockCounterpartyRoleCodes);

    counterpartyService = new GiftCounterpartyService(giftHttpService, logger);
    counterpartyService.getAllRoles = mockGetAllRoles;
    counterpartyService.getAllRoleCodes = mockGetAllRoleCodes;

    mockGetSupportedCurrencies = jest.fn().mockResolvedValueOnce(mockResponse200(CURRENCIES));

    currencyService = new GiftCurrencyService(giftHttpService, logger);
    currencyService.getSupportedCurrencies = mockGetSupportedCurrencies;

    mockGetAllFeeTypeCodes = jest.fn().mockResolvedValueOnce([]);
    feeTypeService = new GiftFeeTypeService(giftHttpService, logger);
    feeTypeService.getAllFeeTypeCodes = mockGetAllFeeTypeCodes;

    mockProductTypeIsSupported = jest.fn().mockResolvedValueOnce(true);

    productTypeService = new GiftProductTypeService(giftHttpService, logger);
    productTypeService.isSupported = mockProductTypeIsSupported;

    httpService = giftHttpService;

    mdmService = new MdmService(httpService, logger);

    mockGetAllSubtypesByProductTypeCode = jest.fn().mockResolvedValueOnce(mockObligationSubtypes);
    mdmService.getAllObligationSubtypesByProductTypeCode = mockGetAllSubtypesByProductTypeCode;

    service = new GiftFacilityAsyncValidationService(logger, counterpartyService, currencyService, feeTypeService, mdmService, productTypeService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('creation', () => {
    it('should call currencyService.getSupportedCurrencies', async () => {
      // Act
      await service.creation(mockBasePayload, mockFacilityId);

      // Assert
      expect(mockGetSupportedCurrencies).toHaveBeenCalledTimes(1);
    });

    it('should call productTypeService.isSupported', async () => {
      // Act
      await service.creation(mockBasePayload, mockFacilityId);

      // Assert
      expect(mockProductTypeIsSupported).toHaveBeenCalledTimes(1);
      expect(mockProductTypeIsSupported).toHaveBeenCalledWith(mockBasePayload.overview.productTypeCode);
    });

    it('should call counterpartyService.getAllRoles', async () => {
      // Act
      await service.creation(mockBasePayload, mockFacilityId);

      // Assert
      expect(mockGetAllRoles).toHaveBeenCalledTimes(1);
    });

    it('should call counterpartyService.getAllRoleCodes', async () => {
      // Act
      await service.creation(mockBasePayload, mockFacilityId);

      // Assert
      expect(mockGetAllRoleCodes).toHaveBeenCalledTimes(1);
      expect(mockGetAllRoleCodes).toHaveBeenCalledWith(COUNTERPARTY_ROLES_RESPONSE_DATA.counterpartyRoles);
    });

    it('should call feeTypeService.getAllFeeTypeCodes', async () => {
      // Act
      await service.creation(mockBasePayload, mockFacilityId);

      // Assert
      expect(mockGetAllFeeTypeCodes).toHaveBeenCalledTimes(1);
    });

    describe('when a single obligation subtype code is provided', () => {
      it('should call mdmService.getAllObligationSubtypesByProductTypeCode', async () => {
        // Arrange
        const mockPayload = {
          ...mockBasePayload,
          obligations: [
            {
              ...mockBasePayload.obligations[0],
              subtypeCode: 'Mock subtype code',
            },
          ],
        };

        // Act
        await service.creation(mockPayload, mockFacilityId);

        // Assert
        expect(mockGetAllSubtypesByProductTypeCode).toHaveBeenCalledTimes(1);
        expect(mockGetAllSubtypesByProductTypeCode).toHaveBeenCalledWith(mockBasePayload.overview.productTypeCode);
      });
    });

    describe('when multiple obligation subtype codes are provided', () => {
      it('should call mdmService.getAllObligationSubtypesByProductTypeCode', async () => {
        // Act
        await service.creation(mockBasePayload, mockFacilityId);

        // Assert
        expect(mockGetAllSubtypesByProductTypeCode).toHaveBeenCalledTimes(1);
        expect(mockGetAllSubtypesByProductTypeCode).toHaveBeenCalledWith(mockBasePayload.overview.productTypeCode);
      });
    });

    describe('when no obligation subtype code is provided', () => {
      it('should NOT call mdmService.getAllObligationSubtypesByProductTypeCode', async () => {
        // Arrange
        const mockObligation = {
          amount: OBLIGATION().amount,
          currency: OBLIGATION().currency,
          effectiveDate: OBLIGATION().effectiveDate,
          maturityDate: OBLIGATION().maturityDate,
          repaymentType: OBLIGATION().repaymentType,
        };

        const mockPayload = {
          ...mockBasePayload,
          obligations: [mockObligation],
        };

        // Act
        await service.creation(mockPayload, mockFacilityId);

        // Assert
        expect(mockGetAllSubtypesByProductTypeCode).toHaveBeenCalledTimes(0);
      });
    });

    describe('when a null obligation subtype code is provided', () => {
      it('should NOT call mdmService.getAllObligationSubtypesByProductTypeCode', async () => {
        // Arrange
        const mockPayload = {
          ...mockBasePayload,
          obligations: [
            {
              ...mockBasePayload.obligations[0],
              subtypeCode: null,
            },
          ],
        };

        // Act
        await service.creation(mockPayload, mockFacilityId);

        // Assert
        expect(mockGetAllSubtypesByProductTypeCode).toHaveBeenCalledTimes(0);
      });
    });

    describe('when fixedFees is NOT provided', () => {
      it('should NOT call feeTypeService.getAllFeeTypeCodes', async () => {
        // Arrange
        const mockPayload = FACILITY_CREATION_PAYLOAD_NO_FIXED_FEES;

        // Act
        await service.creation(mockPayload, mockFacilityId);

        // Assert
        expect(mockGetAllFeeTypeCodes).toHaveBeenCalledTimes(0);
      });
    });

    describe('when fixedFees is provided as an empty array', () => {
      it('should NOT call feeTypeService.getAllFeeTypeCodes', async () => {
        // Arrange
        const mockPayload = {
          ...mockBasePayload,
          fixedFees: [],
        };

        // Act
        await service.creation(mockPayload, mockFacilityId);

        // Assert
        expect(mockGetAllFeeTypeCodes).toHaveBeenCalledTimes(0);
      });
    });

    describe('when all service calls are successful', () => {
      it('should return validation errors from various helper functions', async () => {
        // Act
        const response = await service.creation(mockBasePayload, mockFacilityId);

        // Assert
        const overviewErrors = generateOverviewErrors({
          isSupportedProductType: true,
          payload: mockBasePayload.overview,
          supportedCurrencies: CURRENCIES,
        });

        const currencyErrors = generateHighLevelErrors({
          payload: stripPayload(mockBasePayload, 'currency'),
          supportedValues: CURRENCIES,
          fieldName: 'currency',
        });

        const counterpartyRoleErrors = generateArrayOfErrors({
          fieldValues: mapEntitiesByField(mockBasePayload.counterparties, 'roleCode'),
          supportedValues: mockCounterpartyRoleCodes,
          fieldName: 'roleCode',
          parentEntityName: 'counterparties',
        });

        const counterpartySharePercentageErrors = generateCounterpartySharePercentageErrors({
          counterpartyRoles: COUNTERPARTY_ROLES_RESPONSE_DATA.counterpartyRoles,
          providedCounterparties: mockBasePayload.counterparties,
        });

        const feeTypeCodeErrors = generateArrayOfErrors({
          fieldValues: mapEntitiesByField(mockBasePayload.fixedFees, 'feeTypeCode'),
          supportedValues: [],
          fieldName: 'feeTypeCode',
          parentEntityName: 'fixedFees',
        });

        const obligationSubtypeCodeErrors = generateObligationSubtypeCodeErrors({
          subtypes: mockObligationSubtypes,
          productTypeCode: mockBasePayload.overview.productTypeCode,
          providedSubtypeCodes: getObligationSubtypeCodes(mockBasePayload.obligations),
        });

        const expected = [
          ...overviewErrors,
          ...currencyErrors,
          ...counterpartyRoleErrors,
          ...counterpartySharePercentageErrors,
          ...feeTypeCodeErrors,
          ...obligationSubtypeCodeErrors,
        ];

        expect(response).toEqual(expected);
      });
    });

    describe('when feeTypeService.getAllFeeTypeCodes returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetAllFeeTypeCodes = jest.fn().mockRejectedValueOnce(mockError);

        feeTypeService.getAllFeeTypeCodes = mockGetAllFeeTypeCodes;

        service = new GiftFacilityAsyncValidationService(logger, counterpartyService, currencyService, feeTypeService, mdmService, productTypeService);
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.creation(mockBasePayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility - async ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when currencyService.getSupportedCurrencies returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetSupportedCurrencies = jest.fn().mockRejectedValueOnce(mockError);

        currencyService.getSupportedCurrencies = mockGetSupportedCurrencies;

        service = new GiftFacilityAsyncValidationService(logger, counterpartyService, currencyService, feeTypeService, mdmService, productTypeService);
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.creation(mockBasePayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility - async ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when productTypeService.isSupported returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockProductTypeIsSupported = jest.fn().mockRejectedValueOnce(mockError);

        productTypeService.isSupported = mockProductTypeIsSupported;

        service = new GiftFacilityAsyncValidationService(logger, counterpartyService, currencyService, feeTypeService, mdmService, productTypeService);
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.creation(mockBasePayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility - async ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when mdmService.getAllObligationSubtypesByProductTypeCode returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockGetAllSubtypesByProductTypeCode = jest.fn().mockRejectedValueOnce(mockError);

        mdmService.getAllObligationSubtypesByProductTypeCode = mockGetAllSubtypesByProductTypeCode;

        service = new GiftFacilityAsyncValidationService(logger, counterpartyService, currencyService, feeTypeService, mdmService, productTypeService);
      });

      it('should throw an error', async () => {
        // Act
        const promise = service.creation(mockBasePayload, mockFacilityId);

        // Assert
        const expected = new Error(`Error validating a GIFT facility - async ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
