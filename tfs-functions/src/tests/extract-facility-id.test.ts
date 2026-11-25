import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { extractFacilityIds } from '../utils/extract-facility-id';

const MOCK_FACILITY_ID = '00111111111';

describe('extractFacilityIds', () => {
  describe('when messageType is facility-amendment', () => {
    it('returns the facilityId from the message', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, facilityId: MOCK_FACILITY_ID, payload: {} };

      expect(extractFacilityIds(item)).toBe(MOCK_FACILITY_ID);
    });

    it('returns UNKNOWN_FACILITY_ID when facilityId is missing', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, facilityId: undefined as any, payload: {} };

      expect(extractFacilityIds(item)).toBe('UNKNOWN_FACILITY_ID');
    });
  });

  describe('when messageType is facility-creation', () => {
    it('returns the facilityId from the payload overview', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: { overview: { facilityId: MOCK_FACILITY_ID } } };

      expect(extractFacilityIds(item)).toBe(MOCK_FACILITY_ID);
    });

    it('returns UNKNOWN_FACILITY_ID when payload overview is missing', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: {} };

      expect(extractFacilityIds(item)).toBe('UNKNOWN_FACILITY_ID');
    });

    it('returns UNKNOWN_FACILITY_ID when payload is null', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: null };

      expect(extractFacilityIds(item)).toBe('UNKNOWN_FACILITY_ID');
    });
  });

  describe('when messageType is facility-get', () => {
    it('returns the facilityId from the message', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET, facilityId: MOCK_FACILITY_ID };

      expect(extractFacilityIds(item)).toBe(MOCK_FACILITY_ID);
    });

    it('returns UNKNOWN_FACILITY_ID when facilityId is missing', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET, facilityId: undefined as any };

      expect(extractFacilityIds(item)).toBe('UNKNOWN_FACILITY_ID');
    });
  });

  describe('when messageType is facility-get-many', () => {
    it('returns the comma-joined ids from the message', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY, ids: [MOCK_FACILITY_ID, '00222222222'] };

      expect(extractFacilityIds(item)).toBe(`${MOCK_FACILITY_ID},00222222222`);
    });

    it('returns UNKNOWN_FACILITY_ID when ids is empty', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_GET_MANY, ids: [] };

      expect(extractFacilityIds(item)).toBe('UNKNOWN_FACILITY_ID');
    });
  });

  describe('when messageType is unknown', () => {
    it('returns UNKNOWN_FACILITY_ID', () => {
      const item = { messageType: 'UNEXPECTED_TYPE' as any, payload: {} };

      expect(extractFacilityIds(item)).toBe('UNKNOWN_FACILITY_ID');
    });
  });

  describe('when item is malformed', () => {
    it('returns UNKNOWN_FACILITY_ID when item is null', () => {
      expect(extractFacilityIds(null)).toBe('UNKNOWN_FACILITY_ID');
    });

    it('returns UNKNOWN_FACILITY_ID when item is a string', () => {
      expect(extractFacilityIds('not-an-object')).toBe('UNKNOWN_FACILITY_ID');
    });

    it('returns UNKNOWN_FACILITY_ID when item is a number', () => {
      expect(extractFacilityIds(42)).toBe('UNKNOWN_FACILITY_ID');
    });
  });
});
