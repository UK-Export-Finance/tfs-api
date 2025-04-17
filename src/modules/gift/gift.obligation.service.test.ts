import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';

import { GiftObligationService } from './gift.obligation.service';
const {
  GIFT: { OBLIGATION, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { PATH } = GIFT;

const expectedPath = `${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.OBLIGATION}${PATH.CREATION_EVENT}`;

describe('GiftObligationService', () => {
  let httpService: HttpService;
  let service: GiftObligationService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockCreateOneResponse = mockResponse201(OBLIGATION());

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftObligationService(giftHttpService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockPayload = OBLIGATION();

    it('should call giftHttpService.post', async () => {
      await service.createOne(mockPayload, mockWorkPackageId);

      expect(mockHttpServicePost).toHaveBeenCalledTimes(1);

      expect(mockHttpServicePost).toHaveBeenCalledWith({
        path: expectedPath,
        payload: mockPayload,
      });
    });

    describe('when giftHttpService.post is successful', () => {
      it('should return the response of giftHttpService.post', async () => {
        const response = await service.createOne(mockPayload, mockWorkPackageId);

        expect(response).toEqual(mockCreateOneResponse);
      });
    });

    describe('when giftHttpService.post returns an error', () => {
      beforeEach(() => {
        mockHttpServicePost = jest.fn().mockRejectedValueOnce(mockResponse500());

        giftHttpService.post = mockHttpServicePost;

        service = new GiftObligationService(giftHttpService);
      });

      it('should thrown an error', async () => {
        const promise = service.createOne(mockPayload, mockWorkPackageId);

        const expected = 'Error creating obligation';

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const obligationsLength = 3;

    const mockObligations = Array(obligationsLength).fill(OBLIGATION());

    const mockPayload = mockObligations;

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockObligations));

    beforeEach(() => {
      mockCreateOneResponse = mockResponse201(mockObligations);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockObligations[0]))
        .mockResolvedValueOnce(mockResponse201(mockObligations[1]))
        .mockResolvedValueOnce(mockResponse201(mockObligations[2]));

      service = new GiftObligationService(giftHttpService);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided obligation', async () => {
      await service.createMany(mockPayload, mockWorkPackageId);

      expect(mockCreateOne).toHaveBeenCalledTimes(obligationsLength);

      expect(mockCreateOne).toHaveBeenCalledWith(mockPayload[0], mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockPayload[1], mockWorkPackageId);
      expect(mockCreateOne).toHaveBeenCalledWith(mockPayload[2], mockWorkPackageId);
    });

    describe('when service.createOne is successful', () => {
      it('should return the response of multiple calls to service.createOne', async () => {
        const response = await service.createMany(mockPayload, mockWorkPackageId);

        const expected = [mockCreateOneResponse, mockCreateOneResponse, mockCreateOneResponse];

        expect(response).toEqual(expected);
      });
    });

    describe('when service.createOne returns an error', () => {
      beforeEach(() => {
        mockCreateOne = jest.fn().mockRejectedValueOnce(mockResponse500());

        service = new GiftObligationService(giftHttpService);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        const promise = service.createMany(mockPayload, mockWorkPackageId);

        const expected = 'Error creating obligations';

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
