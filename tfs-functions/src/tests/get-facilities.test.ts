import { getFacilities } from '../functions/get-facilities';
import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { createHaloTicket } from '../utils/create-halo-ticket';
import { getFromTfsApi } from '../utils/get-from-tfs-api';

const apimTfsUrl = process.env.APIM_TFS_URL;
const mockIds = '0011111111,0022222222';

jest.mock('../utils/get-from-tfs-api');
jest.mock('../utils/create-halo-ticket');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

const buildRequest = (ids: string | null) =>
  ({
    query: { get: jest.fn().mockReturnValue(ids) },
  }) as any;

describe('getFacilities', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls getFromTfsApi with the facilities URL and returns a 200 response with the data', async () => {
    // Arrange
    const mockFacilitiesData = [{ facilityId: '0011111111' }, { facilityId: '0022222222' }];

    (getFromTfsApi as jest.Mock).mockResolvedValue(mockFacilitiesData);

    // Act
    const response = await getFacilities(buildRequest(mockIds), context as any);

    // Assert
    expect(getFromTfsApi).toHaveBeenCalledTimes(1);
    expect(getFromTfsApi).toHaveBeenCalledWith(`${apimTfsUrl}/api/v2/gift/facilities?ids=${mockIds}`, `Failed to get GIFT facilities ${mockIds}`, context);
    expect(response).toStrictEqual({ status: 200, jsonBody: mockFacilitiesData });
  });

  it('defaults to an empty ids string when the query parameter is missing', async () => {
    // Arrange
    (getFromTfsApi as jest.Mock).mockResolvedValue([]);

    // Act
    await getFacilities(buildRequest(null), context as any);

    // Assert
    expect(getFromTfsApi).toHaveBeenCalledWith(`${apimTfsUrl}/api/v2/gift/facilities?ids=`, 'Failed to get GIFT facilities ', context);
  });

  it('does not call createHaloTicket when getFromTfsApi succeeds', async () => {
    // Arrange
    (getFromTfsApi as jest.Mock).mockResolvedValue([]);

    // Act
    await getFacilities(buildRequest(mockIds), context as any);

    // Assert
    expect(createHaloTicket).not.toHaveBeenCalled();
  });

  describe('when getFromTfsApi throws', () => {
    it('calls createHaloTicket and returns a 502 response', async () => {
      // Arrange
      const error = new Error(`Failed to get GIFT facilities ${mockIds}, status: 404, response: {"error":"Not Found"}`);

      (getFromTfsApi as jest.Mock).mockRejectedValue(error);
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await getFacilities(buildRequest(mockIds), context as any);

      // Assert
      expect(createHaloTicket).toHaveBeenCalledTimes(1);
      expect(createHaloTicket).toHaveBeenCalledWith(mockIds, { ids: mockIds }, error.message, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY, context);
      expect(response).toStrictEqual({ status: 502, jsonBody: { message: error.message } });
    });

    it('handles a non-Error being thrown', async () => {
      // Arrange
      (getFromTfsApi as jest.Mock).mockRejectedValue('unexpected string error');
      (createHaloTicket as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await getFacilities(buildRequest(mockIds), context as any);

      // Assert
      expect(createHaloTicket).toHaveBeenCalledWith(mockIds, { ids: mockIds }, 'Unknown error', GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY, context);
      expect(response).toStrictEqual({ status: 502, jsonBody: { message: 'Unknown error' } });
    });
  });
});
