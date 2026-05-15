import { GIFT_QUEUE_MESSAGE_TYPE } from '../types/queue-message.type';
import { extractFacilityId } from '../utils/extract-facility-id';

const MOCK_FACILITY_ID = '00111111111';

describe('extractFacilityId', () => {
  describe('when messageType is facility-amendment', () => {
    it('returns the facilityId from the message', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, facilityId: MOCK_FACILITY_ID, payload: {} };

      expect(extractFacilityId(item)).toBe(MOCK_FACILITY_ID);
    });

    it('returns UNKNOWN_FACILITY_ID when facilityId is missing', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_AMENDMENT, facilityId: undefined as any, payload: {} };

      expect(extractFacilityId(item)).toBe('UNKNOWN_FACILITY_ID');
    });
  });

  describe('when messageType is facility-creation', () => {
    it('returns the facilityId from the payload overview', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: { overview: { facilityId: MOCK_FACILITY_ID } } };

      expect(extractFacilityId(item)).toBe(MOCK_FACILITY_ID);
    });

    it('returns UNKNOWN_FACILITY_ID when payload overview is missing', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: {} };

      expect(extractFacilityId(item)).toBe('UNKNOWN_FACILITY_ID');
    });

    it('returns UNKNOWN_FACILITY_ID when payload is null', () => {
      const item = { messageType: GIFT_QUEUE_MESSAGE_TYPE.FACILITY_CREATION, payload: null };

      expect(extractFacilityId(item)).toBe('UNKNOWN_FACILITY_ID');
    });
  });

  describe('when messageType is unknown', () => {
    it('returns UNKNOWN_FACILITY_ID', () => {
      const item = { messageType: 'UNEXPECTED_TYPE' as any, payload: {} };

      expect(extractFacilityId(item)).toBe('UNKNOWN_FACILITY_ID');
    });
  });
});
