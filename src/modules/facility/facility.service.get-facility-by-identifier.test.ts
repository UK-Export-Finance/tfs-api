import { PROPERTIES } from '@ukef/constants';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityService } from '@ukef/modules/acbs/acbs-facility.service';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityByIdentifierResponseDto } from '@ukef/modules/facility/dto/get-facility-by-identifier-response.dto';
import { FacilityService } from '@ukef/modules/facility/facility.service';
import { getMockAcbsAuthenticationService } from '@ukef-test/support/abcs-authentication.service.mock';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

jest.mock('@ukef/modules/acbs/acbs-facility.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('FacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();

  let acbsAuthenticationService: AcbsAuthenticationService;
  let acbsBundleInformationService: AcbsBundleInformationService;
  let acbsFacilityService: AcbsFacilityService;
  let service: FacilityService;

  let acbsFacilityServiceGetFacilityByIdentifier: jest.Mock;

  beforeEach(() => {
    acbsFacilityService = new AcbsFacilityService(null, null);

    acbsFacilityServiceGetFacilityByIdentifier = jest.fn();
    acbsFacilityService.getFacilityByIdentifier = acbsFacilityServiceGetFacilityByIdentifier;

    acbsBundleInformationService = new AcbsBundleInformationService(null, null);

    const mockAcbsAuthenticationService = getMockAcbsAuthenticationService();
    acbsAuthenticationService = mockAcbsAuthenticationService.service;
    const acbsAuthenticationServiceGetIdToken = mockAcbsAuthenticationService.getIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    service = new FacilityService(
      acbsAuthenticationService,
      acbsBundleInformationService,
      acbsFacilityService,
      dateStringTransformations,
      new CurrentDateProvider(),
    );
  });

  describe('getFacilityByIdentifier', () => {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const facilityIdentifier = valueGenerator.ukefId();
    const { facilitiesInAcbs, facilitiesFromApi } = new GetFacilityGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
      facilityIdentifier,
      portfolioIdentifier,
    });

    it('returns a transformation of the facility from ACBS when OriginalEffectiveDate IS NOT null', async () => {
      const originalEffectiveDateInAcbs = '2023-04-11T00:00:00Z';
      const expectedEffectiveDate = '2023-04-11';
      const facilityInAcbs: AcbsGetFacilityResponseDto = {
        ...facilitiesInAcbs[0],
        OriginalEffectiveDate: originalEffectiveDateInAcbs,
      };
      const expectedFacility: GetFacilityByIdentifierResponseDto = {
        ...facilitiesFromApi[0],
        effectiveDate: expectedEffectiveDate,
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(facilityInAcbs);

      const facility = await service.getFacilityByIdentifier(facilityIdentifier);

      expect(facility).toStrictEqual(expectedFacility);
    });

    it('returns a transformation of the facility from ACBS when OriginalEffectiveDate IS null', async () => {
      const facilityInAcbs: AcbsGetFacilityResponseDto = {
        ...facilitiesInAcbs[0],
        OriginalEffectiveDate: null,
      };
      const expectedFacility: GetFacilityByIdentifierResponseDto = {
        ...facilitiesFromApi[0],
        effectiveDate: null,
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(facilityInAcbs);

      const facility = await service.getFacilityByIdentifier(facilityIdentifier);

      expect(facility).toStrictEqual(expectedFacility);
    });

    it('returns a transformation of the facility from ACBS when ExpirationDate IS NOT null', async () => {
      const expirationDateInAcbs = '2023-04-11T00:00:00Z';
      const expectedGuaranteeExpiryDate = '2023-04-11';
      const facilityInAcbs: AcbsGetFacilityResponseDto = {
        ...facilitiesInAcbs[0],
        ExpirationDate: expirationDateInAcbs,
      };
      const expectedFacility: GetFacilityByIdentifierResponseDto = {
        ...facilitiesFromApi[0],
        guaranteeExpiryDate: expectedGuaranteeExpiryDate,
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(facilityInAcbs);

      const facility = await service.getFacilityByIdentifier(facilityIdentifier);

      expect(facility).toStrictEqual(expectedFacility);
    });

    it('returns a transformation of the facility from ACBS when ExpirationDate IS null', async () => {
      const facilityInAcbs: AcbsGetFacilityResponseDto = {
        ...facilitiesInAcbs[0],
        ExpirationDate: null,
      };
      const expectedFacility: GetFacilityByIdentifierResponseDto = {
        ...facilitiesFromApi[0],
        guaranteeExpiryDate: null,
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(facilityInAcbs);

      const facility = await service.getFacilityByIdentifier(facilityIdentifier);

      expect(facility).toStrictEqual(expectedFacility);
    });

    it('returns a transformation of the facility from ACBS when UserDefinedDate1 IS NOT null', async () => {
      const userDefinedDate1InAcbs = '2023-04-11T00:00:00Z';
      const expectedIssueDate = '2023-04-11';
      const facilityInAcbs: AcbsGetFacilityResponseDto = {
        ...facilitiesInAcbs[0],
        UserDefinedDate1: userDefinedDate1InAcbs,
      };
      const expectedFacility: GetFacilityByIdentifierResponseDto = {
        ...facilitiesFromApi[0],
        issueDate: expectedIssueDate,
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(facilityInAcbs);

      const facility = await service.getFacilityByIdentifier(facilityIdentifier);

      expect(facility).toStrictEqual(expectedFacility);
    });

    it('returns a transformation of the facility from ACBS when UserDefinedDate1 IS null', async () => {
      const facilityInAcbs: AcbsGetFacilityResponseDto = {
        ...facilitiesInAcbs[0],
        UserDefinedDate1: null,
      };
      const expectedFacility: GetFacilityByIdentifierResponseDto = {
        ...facilitiesFromApi[0],
        issueDate: null,
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(facilityInAcbs);

      const facility = await service.getFacilityByIdentifier(facilityIdentifier);

      expect(facility).toStrictEqual(expectedFacility);
    });

    it('returns a transformation of the facility from ACBS when UserDefinedDate2 IS NOT null', async () => {
      const userDefinedDate2InAcbs = '2023-04-11T00:00:00Z';
      const expectedGuaranteeCommencementDate = '2023-04-11';
      const expectedNextQuarterEndDate = '2023-04-11';
      const facilityInAcbs: AcbsGetFacilityResponseDto = {
        ...facilitiesInAcbs[0],
        UserDefinedDate2: userDefinedDate2InAcbs,
      };
      const expectedFacility: GetFacilityByIdentifierResponseDto = {
        ...facilitiesFromApi[0],
        guaranteeCommencementDate: expectedGuaranteeCommencementDate,
        nextQuarterEndDate: expectedNextQuarterEndDate,
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(facilityInAcbs);

      const facility = await service.getFacilityByIdentifier(facilityIdentifier);

      expect(facility).toStrictEqual(expectedFacility);
    });

    it('returns a transformation of the facility from ACBS when UserDefinedDate2 IS null', async () => {
      const facilityInAcbs: AcbsGetFacilityResponseDto = {
        ...facilitiesInAcbs[0],
        UserDefinedDate2: null,
      };
      const expectedFacility: GetFacilityByIdentifierResponseDto = {
        ...facilitiesFromApi[0],
        guaranteeCommencementDate: null,
        nextQuarterEndDate: null,
      };
      when(acbsFacilityServiceGetFacilityByIdentifier).calledWith(facilityIdentifier, idToken).mockResolvedValueOnce(facilityInAcbs);

      const facility = await service.getFacilityByIdentifier(facilityIdentifier);

      expect(facility).toStrictEqual(expectedFacility);
    });
  });
});
