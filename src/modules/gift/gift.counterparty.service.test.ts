import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftCounterpartyService } from './gift.counterparty.service';
const {
  GIFT: { COUNTERPARTY, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, PATH } = GIFT;

describe('GiftCounterpartyService', () => {
  const logger = new PinoLogger({});

  let httpService: HttpService;
  let service: GiftCounterpartyService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    httpService = new HttpService();

    mockCreateOneResponse = mockResponse201(COUNTERPARTY());

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftCounterpartyService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockCounterparty = COUNTERPARTY();

    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne(mockCounterparty, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_COUNTERPARTY}`,
        payload: mockCounterparty,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne(mockCounterparty, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftCounterpartyService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne(mockCounterparty, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating a counterparty for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const counterpartiesLength = 3;

    const mockCounterparties = Array(counterpartiesLength).fill(COUNTERPARTY());

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockCounterparties));

    beforeEach(() => {
      // Arrange
      mockCreateOneResponse = mockResponse201(mockCounterparties);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockCounterparties[0]))
        .mockResolvedValueOnce(mockResponse201(mockCounterparties[1]))
        .mockResolvedValueOnce(mockResponse201(mockCounterparties[2]));

      service = new GiftCounterpartyService(giftHttpService, logger);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided counterparty', async () => {
      // Act
      await service.createMany(mockCounterparties, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockCreateOne).toHaveBeenCalledTimes(counterpartiesLength);

      expect(mockCreateOne).toHaveBeenCalledWith(mockCounterparties[0], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockCounterparties[1], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockCounterparties[2], mockFacilityId, mockWorkPackageId);
    });

    describe('when service.createOne is successful', () => {
      it('should return the response of multiple calls to service.createOne', async () => {
        // Act
        const response = await service.createMany(mockCounterparties, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = [mockCreateOneResponse, mockCreateOneResponse, mockCreateOneResponse];

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createOne returns an error', () => {
      beforeEach(() => {
        // Arrange
        mockCreateOne = jest.fn().mockRejectedValueOnce(mockResponse500());

        service = new GiftCounterpartyService(giftHttpService, logger);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createMany(mockCounterparties, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating counterparties for facility ${mockFacilityId}`);

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
