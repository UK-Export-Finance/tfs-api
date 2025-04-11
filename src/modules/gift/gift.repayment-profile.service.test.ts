import { HttpService } from '@nestjs/axios';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { mockResponse201, mockResponse500 } from '@ukef-test/http-response';

import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
const {
  GIFT: { REPAYMENT_PROFILE, WORK_PACKAGE_ID: mockWorkPackageId },
} = EXAMPLES;

const { PATH } = GIFT;

const expectedPath = `${PATH.WORK_PACKAGE}/${mockWorkPackageId}${PATH.REPAYMENT_PROFILE}${PATH.MANUAL}${PATH.CREATION_EVENT}`;

describe('GiftRepaymentProfileService', () => {
  let httpService: HttpService;
  let service: GiftRepaymentProfileService;

  let giftHttpService;
  let mockCreateOneResponse;
  let mockHttpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    mockCreateOneResponse = mockResponse201(REPAYMENT_PROFILE());

    mockHttpServicePost = jest.fn().mockResolvedValueOnce(mockCreateOneResponse);

    httpService.post = mockHttpServicePost;

    giftHttpService = {
      post: mockHttpServicePost,
    };

    service = new GiftRepaymentProfileService(giftHttpService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('createOne', () => {
    const mockPayload = REPAYMENT_PROFILE();

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

        service = new GiftRepaymentProfileService(giftHttpService);
      });

      it('should thrown an error', async () => {
        const promise = service.createOne(mockPayload, mockWorkPackageId);

        const expected = 'Error creating repayment profile';

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });

  describe('createMany', () => {
    const repaymentProfilesLength = 3;

    const mockRepaymentProfiles = Array(repaymentProfilesLength).fill(REPAYMENT_PROFILE());

    const mockPayload = mockRepaymentProfiles;

    let mockCreateOne = jest.fn().mockResolvedValue(mockResponse201(mockRepaymentProfiles));

    beforeEach(() => {
      mockCreateOneResponse = mockResponse201(mockRepaymentProfiles);

      giftHttpService.post = jest
        .fn()
        .mockResolvedValueOnce(mockResponse201(mockRepaymentProfiles[0]))
        .mockResolvedValueOnce(mockResponse201(mockRepaymentProfiles[1]))
        .mockResolvedValueOnce(mockResponse201(mockRepaymentProfiles[2]));

      service = new GiftRepaymentProfileService(giftHttpService);

      service.createOne = mockCreateOne;
    });

    it('should call service.createOne for each provided repayment profile', async () => {
      await service.createMany(mockPayload, mockWorkPackageId);

      expect(mockCreateOne).toHaveBeenCalledTimes(repaymentProfilesLength);

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

        service = new GiftRepaymentProfileService(giftHttpService);

        service.createOne = mockCreateOne;
      });

      it('should thrown an error', async () => {
        const promise = service.createMany(mockPayload, mockWorkPackageId);

        const expected = 'Error creating repayment profiles';

        await expect(promise).rejects.toThrow(expected);
      });
    });
  });
});
