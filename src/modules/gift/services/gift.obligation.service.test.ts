import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse400, mockResponse418, mockResponse500 } from '@ukef-test/http-response';
import { PinoLogger } from 'nestjs-pino';

import { GiftObligationService } from './gift.obligation.service';

const {
  GIFT: { OBLIGATION, FACILITY_ID: mockFacilityId, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { EVENT_TYPES, PATH } = GIFT;

describe('GiftObligationService', () => {
  const logger = new PinoLogger({});

  let service: GiftObligationService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    // Arrange
    mockCreateOneResponse = mockResponse201(OBLIGATION());

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftObligationService(giftHttpService, logger);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockObligation = OBLIGATION();

    it('should call giftHttpService.post', async () => {
      // Act
      await service.createOne(mockObligation, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: `${PATH.FACILITY}/${mockFacilityId}${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.CONFIGURATION_EVENT}/${EVENT_TYPES.ADD_OBLIGATION}`,
        payload: {
          ...mockObligation,
          acbsObligationId: null,
        },
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        // Act
        const response = await service.createOne(mockObligation, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      const mockError = mockResponse500();

      beforeEach(() => {
        // Arrange
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockError);

        giftHttpService.post = mockHttpServicePost;

        service = new GiftObligationService(giftHttpService, logger);
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createOne(mockObligation, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating an obligation with amount ${mockObligation.amount} for facility ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const obligationsLength = 3;

    const mockObligations = Array(obligationsLength).fill(OBLIGATION());

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockObligations));

    beforeEach(() => {
      // Arrange
      mockCreateOneResponse = mockResponse201(mockObligations);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockObligations[0]))
        .mockResolvedValueOnce(mockResponse201(mockObligations[1]))
        .mockResolvedValueOnce(mockResponse201(mockObligations[2]));

      service = new GiftObligationService(giftHttpService, logger);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided obligation', async () => {
      // Act
      await service.createMany(mockObligations, mockFacilityId, mockWorkPackageId);

      // Assert
      expect(mockCreateOne).toHaveBeenCalledTimes(obligationsLength);

      expect(mockCreateOne).toHaveBeenCalledWith(mockObligations[0], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockObligations[1], mockFacilityId, mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockObligations[2], mockFacilityId, mockWorkPackageId);
    });

    describe('when service.createOne is successful', () => {
      it('should return the response of multiple calls to service.createOne', async () => {
        // Act
        const response = await service.createMany(mockObligations, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = [mockCreateOneResponse, mockCreateOneResponse, mockCreateOneResponse];

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createOne returns an error', () => {
      const mockError = mockResponse500();

      beforeEach(() => {
        // Arrange
        mockCreateOne = jest.fn().mockRejectedValueOnce(mockError);

        service = new GiftObligationService(giftHttpService, logger);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        // Act
        const promise = service.createMany(mockObligations, mockFacilityId, mockWorkPackageId);

        // Assert
        const expected = new Error(`Error creating obligations for facility ${mockFacilityId}`, { cause: mockError });

        await expect(promise).rejects.toThrow(expected);
      });
    });

    describe('when service.createOne returns multiple unacceptable and acceptable error statuses', () => {
      beforeEach(() => {
        // Arrange
        mockCreateOneResponse = mockResponse201(mockObligations);

        service = new GiftObligationService(giftHttpService, logger);

        mockCreateOne = jest.fn().mockResolvedValueOnce(mockResponse418()).mockResolvedValueOnce(mockResponse500()).mockResolvedValueOnce(mockResponse400());

        service.createOne = mockCreateOne;
      });

      it('should continue to call service.createOne with mapped data for each provided counterparty', async () => {
        // Act
        await service.createMany(mockObligations, mockFacilityId, mockWorkPackageId);

        // Assert
        expect(mockCreateOne).toHaveBeenCalledTimes(obligationsLength);

        expect(mockCreateOne).toHaveBeenCalledWith(mockObligations[0], mockFacilityId, mockWorkPackageId);
        expect(mockCreateOne).toHaveBeenCalledWith(mockObligations[1], mockFacilityId, mockWorkPackageId);
        expect(mockCreateOne).toHaveBeenCalledWith(mockObligations[2], mockFacilityId, mockWorkPackageId);
      });
    });
  });
});
