import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';

import { GiftCounterpartyService } from './gift.counterparty.service';
const {
  GIFT: { COUNTERPARTY, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { PATH } = GIFT;

const expectedPath = `${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.COUNTERPARTY}${PATH.CREATION_EVENT}`;

describe('GiftCounterpartyService', () => {
  let httpService: HttpService;
  let service: GiftCounterpartyService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockCreateOneResponse = mockResponse201(COUNTERPARTY());

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftCounterpartyService(giftHttpService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockPayload = COUNTERPARTY();

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

        service = new GiftCounterpartyService(giftHttpService);
      });

      it('should thrown an error', async () => {
        const promise = service.createOne(mockPayload, mockWorkPackageId);

        const expected = new Error('Error creating counterparty');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const counterpartiesLength = 3;

    const mockCounterparties = Array(counterpartiesLength).fill(COUNTERPARTY());

    const mockPayload = mockCounterparties;

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockCounterparties));

    beforeEach(() => {
      mockCreateOneResponse = mockResponse201(mockCounterparties);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockCounterparties[0]))
        .mockResolvedValueOnce(mockResponse201(mockCounterparties[1]))
        .mockResolvedValueOnce(mockResponse201(mockCounterparties[2]));

      service = new GiftCounterpartyService(giftHttpService);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided counterparty', async () => {
      await service.createMany(mockPayload, mockWorkPackageId);

      expect(mockCreateOne).toHaveBeenCalledTimes(counterpartiesLength);

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

        service = new GiftCounterpartyService(giftHttpService);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        const promise = service.createMany(mockPayload, mockWorkPackageId);

        const expected = new Error('Error creating counterparties');

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
