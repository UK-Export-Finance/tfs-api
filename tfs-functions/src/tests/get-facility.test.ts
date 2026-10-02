import { getFacility } from '../functions/get-facility';
import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { createHaloTicket } from '../utils/create-halo-ticket';
import { getFromTfsApi } from '../utils/get-from-tfs-api';

const mockFacilityId = '0011111111';

jest.mock('../utils/get-from-tfs-api');
jest.mock('../utils/create-halo-ticket');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

const request = {
  params: { facilityId: mockFacilityId },
} as any;

describe('getFacility', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls getFromTfsApi with the facility path and returns a 200 response with the data', async () => {
    // Arrange
    const mockFacilityData = { facilityId: mockFacilityId };

    (getFromTfsApi as jest.Mock).mockResolvedValue(mockFacilityData);

    // Act
    const response = await getFacility(request, context as any);

    // Assert
    expect(getFromTfsApi).toHaveBeenCalledTimes(1);
    expect(getFromTfsApi).toHaveBeenCalledWith(
      `/api/v2/gift/facility/without-queue/${mockFacilityId}`,
      {},
      `Failed to get GIFT facility ${mockFacilityId}`,
      context,
    );
    expect(response).toStrictEqual({ status: 200, jsonBody: mockFacilityData });
  });

  it('URL-encodes the facilityId when building the path', async () => {
    // Arrange
    const unsafeFacilityId = '../../evil';

    (getFromTfsApi as jest.Mock).mockResolvedValue({});

    // Act
    await getFacility({ params: { facilityId: unsafeFacilityId } } as any, context as any);

    // Assert
    expect(getFromTfsApi).toHaveBeenCalledWith(
      `/api/v2/gift/facility/without-queue/${encodeURIComponent(unsafeFacilityId)}`,
      {},
      `Failed to get GIFT facility ${unsafeFacilityId}`,
      context,
    );
  });

  it('does not call createHaloTicket when getFromTfsApi succeeds', async () => {
    // Arrange
    (getFromTfsApi as jest.Mock).mockResolvedValue({});

    // Act
    await getFacility(request, context as any);

    // Assert
    expect(createHaloTicket).not.toHaveBeenCalled();
  });

  describe('when getFromTfsApi throws', () => {
    it('calls createHaloTicket and returns a 502 response', async () => {
      // Arrange
      const error = new Error(`Failed to get GIFT facility ${mockFacilityId}, status: 404, response: {"error":"Not Found"}`);

      (getFromTfsApi as jest.Mock).mockRejectedValue(error);
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await getFacility(request, context as any);

      // Assert
      expect(createHaloTicket).toHaveBeenCalledTimes(1);
      expect(createHaloTicket).toHaveBeenCalledWith(
        mockFacilityId,
        { facilityId: mockFacilityId },
        error.message,
        GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET,
        context,
      );
      expect(response).toStrictEqual({ status: 502, jsonBody: { message: error.message } });
    });

    it('handles a non-Error being thrown', async () => {
      // Arrange
      (getFromTfsApi as jest.Mock).mockRejectedValue('unexpected string error');
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await getFacility(request, context as any);

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith(
        mockFacilityId,
        { facilityId: mockFacilityId },
        'Unknown error',
        GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET,
        context,
      );
      expect(response).toStrictEqual({ status: 502, jsonBody: { message: 'Unknown error' } });
    });
  });
});
