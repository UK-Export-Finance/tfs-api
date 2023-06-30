import { TEST_FACILITY_STAGE_CODE } from '@ukef-test/support/constants/test-issue-code.constant';

export const withIssueFacilityTests = ({ givenTheRequestWouldOtherwiseSucceed, updateFacilityRequest, makeRequestWithBody }) => {
  describe('Issue facility tests', () => {
    const { unissuedFacilityStageCode } = TEST_FACILITY_STAGE_CODE;
    it('returns a 400 response if request has an unissued facility stage code', async () => {
      givenTheRequestWouldOtherwiseSucceed();

      const modifiedUpdateFacilityRequest = { ...updateFacilityRequest, facilityStageCode: unissuedFacilityStageCode };

      const { status, body } = await makeRequestWithBody(modifiedUpdateFacilityRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: 'Facility stage code is not issued', statusCode: 400 });
    });
  });
};
