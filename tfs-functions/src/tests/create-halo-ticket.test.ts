import axios from 'axios';
import { GIFT_QUEUE_MESSAGE_TYPE } from 'types/queue-message.type';
import { createHaloTicket } from 'utils/create-halo-ticket';

const { HALO_BASE_URL } = process.env;
const { HALO_TENANT_NAME } = process.env;
const { HALO_AUTH_CLIENT_ID } = process.env;
const { HALO_CLIENT_SECRET } = process.env;
const ticketClientId = Number(process.env.HALO_TICKET_CLIENT_ID);
const ticketTypeId = Number(process.env.HALO_TICKET_TYPE_ID);
const siteId = Number(process.env.HALO_SITE_ID);
const userId = Number(process.env.HALO_USER_ID);
const teamId = Number(process.env.HALO_TEAM_ID);

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

    it('logs an error and resolves if token acquisition fails with an Error', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest.fn().mockRejectedValueOnce(new Error('Unauthorized'));

      // Act
      await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

      // Assert
      expect(context.error).toHaveBeenCalledWith('Failed to create Halo ticket: Unauthorized');
    });

    it('logs an error and resolves if token acquisition fails with a non-Error', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest.fn().mockRejectedValueOnce('unexpected string error');

      // Act
      await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

      // Assert
      expect(context.error).toHaveBeenCalledWith('Failed to create Halo ticket: unknown error');
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

    it('logs an error and resolves if ticket creation fails with an Error', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
        .mockRejectedValueOnce(new Error('Internal Server Error'));

      // Act
      await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

      // Assert
      expect(context.error).toHaveBeenCalledWith('Failed to create Halo ticket: Internal Server Error');
    });

    it('logs an error and resolves if ticket creation fails with a non-Error', async () => {
      // Arrange
      const facilityId = 'abc-123';
      const payload = { facilityId };
      const errorMessage = 'Something went wrong';

      axios.post = jest
        .fn()
        .mockResolvedValueOnce({ data: { access_token: mockAccessToken } })
        .mockRejectedValueOnce('unexpected string error');

      // Act
      await createHaloTicket(facilityId, payload, errorMessage, GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, context as any);

      // Assert
      expect(context.error).toHaveBeenCalledWith('Failed to create Halo ticket: unknown error');
    });
  });
});
