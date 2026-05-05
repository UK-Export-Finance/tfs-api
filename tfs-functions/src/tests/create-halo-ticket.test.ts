// Set mock environment variables before importing modules that depend on them

const HALO_BASE_URL = 'https://mock-halo.com';
const HALO_TENANT_NAME = 'mock-tenant';
const HALO_AUTH_CLIENT_ID = 'mock-client-id';
const HALO_CLIENT_SECRET = 'mock-client-secret';
const HALO_TICKET_CLIENT_ID = '12';
const HALO_TICKET_TYPE_ID = '4';
const HALO_SITE_ID = '18';
const HALO_USER_ID = '25';
const HALO_TEAM_ID = '32';
process.env.HALO_BASE_URL = HALO_BASE_URL;
process.env.HALO_TENANT_NAME = HALO_TENANT_NAME;
process.env.HALO_AUTH_CLIENT_ID = HALO_AUTH_CLIENT_ID;
process.env.HALO_CLIENT_SECRET = HALO_CLIENT_SECRET;
process.env.HALO_TICKET_CLIENT_ID = HALO_TICKET_CLIENT_ID;
process.env.HALO_TICKET_TYPE_ID = HALO_TICKET_TYPE_ID;
process.env.HALO_SITE_ID = HALO_SITE_ID;
process.env.HALO_USER_ID = HALO_USER_ID;
process.env.HALO_TEAM_ID = HALO_TEAM_ID;

const ticketClientId = Number(HALO_TICKET_CLIENT_ID);
const ticketTypeId = Number(HALO_TICKET_TYPE_ID);
const siteId = Number(HALO_SITE_ID);
const userId = Number(HALO_USER_ID);
const teamId = Number(HALO_TEAM_ID);

// eslint-disable-next-line import/first
import axios from 'axios';
// eslint-disable-next-line import/first
import { GIFT_QUEUE_MESSAGE_TYPE } from 'types/queue-message.type';
// eslint-disable-next-line import/first
import { createHaloTicket } from 'utils/create-halo-ticket';

jest.mock('axios');

const context = {
  log: jest.fn(),
  error: jest.fn(),
};

const mockAccessToken = 'mock-access-token';

const buildExpectedTicketBody = (facilityId: string, payload: unknown, errorMessage: string, operationType: string) => [
  {
    summary: `APIM Error submitting DTFS facility ${facilityId} ${operationType} to GIFT`,
    details: `Error: ${errorMessage}\n\nOriginal payload:\n${JSON.stringify(payload, null, 2)}`,
    tickettype_id: ticketTypeId,
    client_id: ticketClientId,
    site_id: siteId,
    user_id: userId,
    team_id: teamId,
    itil_tickettype_id: -1,
    dont_do_rules: true,
    donotapplytemplateintheapi: true,
    return_this: true,
  },
];

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
      await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

      // Assert
      expect(axios.post).toHaveBeenNthCalledWith(
        1,
        `${HALO_BASE_URL}/auth/token?tenant=${HALO_TENANT_NAME}`,
        `grant_type=client_credentials&client_id=${HALO_AUTH_CLIENT_ID}&client_secret=${HALO_CLIENT_SECRET}`,
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
      const createHaloTicketCall = () => createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

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
      const createHaloTicketCall = () => createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

      // Assert
      await expect(createHaloTicketCall()).rejects.toThrow('Failed to acquire Halo access token: unknown error');
      expect(context.error).toHaveBeenCalledWith('Failed to acquire Halo access token: unknown error');
    });
  });

  describe('ticket creation', () => {
    describe('when messageType is facility-creation', () => {
      it('posts a ticket with a summary referencing creation', async () => {
        // Arrange
        const facilityId = 'abc-123';
        const payload = { facilityId, amount: 1000 };
        const errorMessage = 'Failed to create GIFT facility, status: 400, response: {"error":"Bad Request"}';

        axios.post = jest
          .fn()
          .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
          .mockResolvedValueOnce({});

        // Act
        await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

        // Assert
        expect(axios.post).toHaveBeenNthCalledWith(2, `${HALO_BASE_URL}/api/Tickets`, buildExpectedTicketBody(facilityId, payload, errorMessage, 'creation'), {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
        });
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
        await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

        // Assert
        expect(context.log).toHaveBeenCalledWith('Raising Halo ticket for failed GIFT facility creation, facilityId:', facilityId);
        expect(context.log).toHaveBeenCalledWith('Halo ticket raised successfully for facilityId:', facilityId);
        expect(context.error).not.toHaveBeenCalled();
      });
    });

    describe('when messageType is facility-amendment', () => {
      it('posts a ticket with a summary referencing amendment', async () => {
        // Arrange
        const facilityId = 'abc-123';
        const payload = { facilityId, amendmentType: 'INCREASE_AMOUNT' };
        const errorMessage = 'Failed to amend GIFT facility, status: 400, response: {"error":"Bad Request"}';

        axios.post = jest
          .fn()
          .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
          .mockResolvedValueOnce({});

        // Act
        await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, context as any);

        // Assert
        expect(axios.post).toHaveBeenNthCalledWith(2, `${HALO_BASE_URL}/api/Tickets`, buildExpectedTicketBody(facilityId, payload, errorMessage, 'amendment'), {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
        });
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
        await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, context as any);

        // Assert
        expect(context.log).toHaveBeenCalledWith('Raising Halo ticket for failed GIFT facility amendment, facilityId:', facilityId);
        expect(context.log).toHaveBeenCalledWith('Halo ticket raised successfully for facilityId:', facilityId);
        expect(context.error).not.toHaveBeenCalled();
      });
    });

    describe('when messageType is undefined', () => {
      it('posts a ticket with a summary referencing creation as the default', async () => {
        // Arrange
        const facilityId = 'abc-123';
        const payload = { facilityId };
        const errorMessage = 'Something went wrong';

        axios.post = jest
          .fn()
          .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
          .mockResolvedValueOnce({});

        // Act
        await createHaloTicket(facilityId, payload, errorMessage, undefined, context as any);

        // Assert
        expect(axios.post).toHaveBeenNthCalledWith(
          2,
          `${HALO_BASE_URL}/api/Tickets`,
          buildExpectedTicketBody(facilityId, payload, errorMessage, 'creation'),
          expect.anything(),
        );
      });
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
      const createHaloTicketCall = () => createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

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
      const createHaloTicketCall = () => createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

      // Assert
      await expect(createHaloTicketCall()).rejects.toThrow('Failed to create Halo ticket: unknown error');
      expect(context.error).toHaveBeenCalledWith('Failed to create Halo ticket: unknown error');
    });
  });
});
