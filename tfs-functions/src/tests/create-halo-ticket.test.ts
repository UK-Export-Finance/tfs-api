// Set mock environment variables before importing modules that depend on them

const HALO_BASE_URL = 'http://mock-halo.com';
const HALO_TENANT_NAME = 'mock-tenant';
const HALO_CLIENT_ID = 'mock-client-id';
const HALO_CLIENT_SECRET = 'mock-client-secret';
process.env.HALO_BASE_URL = HALO_BASE_URL;
process.env.HALO_TENANT_NAME = HALO_TENANT_NAME;
process.env.HALO_CLIENT_ID = HALO_CLIENT_ID;
process.env.HALO_CLIENT_SECRET = HALO_CLIENT_SECRET;

// eslint-disable-next-line import/first
import axios from 'axios';
// eslint-disable-next-line import/first
import { createHaloTicket } from 'utils/create-halo-ticket';

jest.mock('axios');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

const mockAccessToken = 'mock-access-token';

describe('createHaloTicket', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('token acquisition', () => {
    it('posts to the correct token URL with client credentials', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
        .mockResolvedValueOnce({});

      // Act
      await createHaloTicket(facilityId, payload, errorMessage, context as any);

      // Assert
      expect(axios.post).toHaveBeenNthCalledWith(
        1,
        `${HALO_BASE_URL}/token?tenant=${HALO_TENANT_NAME}`,
        `grant_type=client_credentials&client_id=${HALO_CLIENT_ID}&client_secret=${HALO_CLIENT_SECRET}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
    });

    it('logs an error and throws if token acquisition fails with an Error', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest.fn().mockRejectedValueOnce(new Error('Unauthorized'));

      // Act
      const createHaloTicketCall = () => createHaloTicket(facilityId, payload, errorMessage, context as any);

      // Assert
      await expect(createHaloTicketCall()).rejects.toThrow('Failed to acquire Halo access token: Unauthorized');
      expect(context.error).toHaveBeenCalledWith('Failed to acquire Halo access token: Unauthorized');
    });

    it('logs an error and throws if token acquisition fails with a non-Error', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest.fn().mockRejectedValueOnce('unexpected string error');

      // Act
      const createHaloTicketCall = () => createHaloTicket(facilityId, payload, errorMessage, context as any);

      // Assert
      await expect(createHaloTicketCall()).rejects.toThrow('Failed to acquire Halo access token: unknown error');
      expect(context.error).toHaveBeenCalledWith('Failed to acquire Halo access token: unknown error');
    });
  });

  describe('ticket creation', () => {
    it('posts to the correct tickets URL with correct headers and body', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId, amount: 1000 };
      const errorMessage = 'Failed to create GIFT facility, status: 400, response: {"error":"Bad Request"}';

      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
        .mockResolvedValueOnce({});

      // Act
      await createHaloTicket(facilityId, payload, errorMessage, context as any);

      // Assert
      expect(axios.post).toHaveBeenNthCalledWith(
        2,
        `${HALO_BASE_URL}/Tickets`,
        [
          {
            summary: `APIM Error submitting DTFS facility ${facilityId} to GIFT`,
            details: `Error: ${errorMessage}\n\nOriginal payload:\n${JSON.stringify(payload, null, 2)}`,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('logs the start and success of the ticket creation', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
        .mockResolvedValueOnce({});

      // Act
      await createHaloTicket(facilityId, payload, errorMessage, context as any);

      // Assert
      expect(context.log).toHaveBeenCalledWith('Raising Halo ticket for failed GIFT facility creation, facilityId:', facilityId);
      expect(context.log).toHaveBeenCalledWith('Halo ticket raised successfully for facilityId:', facilityId);
      expect(context.error).not.toHaveBeenCalled();
    });

    it('logs an error and throws if ticket creation fails with an Error', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
        .mockRejectedValueOnce(new Error('Internal Server Error'));

      // Act
      const createHaloTicketCall = () => createHaloTicket(facilityId, payload, errorMessage, context as any);

      // Assert
      await expect(createHaloTicketCall()).rejects.toThrow('Failed to create Halo ticket: Internal Server Error');
      expect(context.error).toHaveBeenCalledWith('Failed to create Halo ticket: Internal Server Error');
    });

    it('logs an error and throws if ticket creation fails with a non-Error', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
        .mockRejectedValueOnce('unexpected string error');

      // Act
      const createHaloTicketCall = () => createHaloTicket(facilityId, payload, errorMessage, context as any);

      // Assert
      await expect(createHaloTicketCall()).rejects.toThrow('Failed to create Halo ticket: unknown error');
      expect(context.error).toHaveBeenCalledWith('Failed to create Halo ticket: unknown error');
    });
  });
});
