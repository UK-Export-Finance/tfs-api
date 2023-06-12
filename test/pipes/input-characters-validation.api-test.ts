import { AssignedRatingCodeEnum } from '@ukef/constants/enums/assigned-rating-code';
import { AcbsCreatePartyExternalRatingRequestDto } from '@ukef/modules/acbs/dto/acbs-create-party-external-rating-request.dto';
import { AcbsCreatePartyRequest } from '@ukef/modules/acbs/dto/acbs-create-party-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { CreatePartyExternalRatingGenerator } from '@ukef-test/support/generator/create-party-external-rating-generator';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('Test InputCharacterValidationPipe', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const textWithUnsupportedUrlCharacters = 'Test &%*?<>#/extra\\:';
  const expectedUnsupportedUrlCharacters = '&%*?<>#/\\:';
  const textWithUnsupportedBodyCharacters = 'Test ąŽİĞİŞのでコン😄😎🍀, µ and ÿ';
  const expectedUnsupportedBodyCharacters = 'ąŽİĞİŞのでコン😄😎🍀µÿ';
  const partyIdentifier = valueGenerator.acbsPartyId();
  const basePartyAlternateIdentifier = valueGenerator.stringOfNumericCharacters({ length: 7 });
  const alternateIdentifier = `${basePartyAlternateIdentifier}0`;
  const safeSearchText = valueGenerator.stringOfNumericCharacters({ minLength: 3 });

  const getGetPartiesBySearchTextUrl = (searchText: string) => `/api/v1/parties?searchText=`.concat(encodeURIComponent(searchText));
  const getGetPartyByIdUrl = (partyIdentifier: string) => `/api/v1/parties/`.concat(encodeURIComponent(partyIdentifier));
  const createPartyUrl = `/api/v1/parties`;

  const { acbsParties, parties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });

  const { acbsCreatePartyRequest, apiCreatePartyRequest } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 2,
    basePartyAlternateIdentifier: basePartyAlternateIdentifier,
  });

  const [{ officerRiskDate: ratedDate }] = apiCreatePartyRequest;

  const { acbsExternalRatingToCreate } = new CreatePartyExternalRatingGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    partyIdentifier,
    assignedRatingCode: '03' as AssignedRatingCodeEnum,
    ratedDate,
  });

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  const { idToken, givenAuthenticationWithTheIdpSucceeds } = withAcbsAuthenticationApiTests({
    givenRequestWouldOtherwiseSucceed: () => requestToGetPartiesBySearchText(safeSearchText).reply(200, acbsParties),
    makeRequest: () => api.get(getGetPartiesBySearchTextUrl(safeSearchText)),
  });

  const { givenAuthenticationWithTheIdpSucceeds: givenAuthenticationWithTheIdpSucceedsById } = withAcbsAuthenticationApiTests({
    givenRequestWouldOtherwiseSucceed: () => requestToGetParty().reply(200, acbsParties[0]),
    makeRequest: () => api.get(getGetPartyByIdUrl(partyIdentifier)),
  });

  describe('Query parameter validation', () => {
    it('returns a 200 response with the matching parties if they are returned by ACBS', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetPartiesBySearchText(safeSearchText).reply(200, acbsParties);
      const { status, body } = await api.get(getGetPartiesBySearchTextUrl(safeSearchText));

      expect(status).toBe(200);
      expect(body).toEqual(parties);
    });

    it('returns a 400 response if the request has unsupported characters', async () => {
      const { status, body } = await api.get(getGetPartiesBySearchTextUrl(textWithUnsupportedUrlCharacters));

      expect(status).toBe(400);
      expect(body).toMatchObject({
        message: 'Bad request',
        error: `URL field searchText has invalid characters ${expectedUnsupportedUrlCharacters}.`,
        statusCode: 400,
      });
    });
  });

  describe('URL parameter validation', () => {
    it('returns a 200 response with the matching party if they are returned by ACBS', async () => {
      givenAuthenticationWithTheIdpSucceedsById();
      requestToGetParty().reply(200, acbsParties[0]);
      const { status, body } = await api.get(getGetPartyByIdUrl(partyIdentifier));

      expect(status).toBe(200);
      expect(body).toEqual(parties[0]);
    });

    it('returns a 400 response if the request has unsupported characters', async () => {
      const { status, body } = await api.get(getGetPartyByIdUrl(textWithUnsupportedUrlCharacters));

      expect(status).toBe(400);
      expect(body).toMatchObject({
        message: 'Bad request',
        error: `URL field partyIdentifier has invalid characters ${expectedUnsupportedUrlCharacters}.`,
        statusCode: 400,
      });
    });
  });

  describe('Body parameter validation', () => {
    it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      givenRequestToCreatePartyExternalRatingSucceeds();

      requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
      requestToCreateParties(acbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ partyIdentifier: partyIdentifier });
    });

    it('returns a 201 response when using characters with ASCII code 32 to 126', async () => {
      const chars32_126CreatePartyRequest = [
        {
          ...apiCreatePartyRequest[0],
          name1: ' !"#$%&\'()*+,-./0123456789:;<=>?@A', // cspell:disable-line
          name2: 'BCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcde', // cspell:disable-line
          name3: 'fghijklmnopqrstuvwxyz{|}~', // cspell:disable-line
        },
      ];
      const chars32_126AcbsCreatePartyRequest = {
        ...acbsCreatePartyRequest,
        PartyName1: chars32_126CreatePartyRequest[0].name1,
        PartyName2: chars32_126CreatePartyRequest[0].name2,
        PartyName3: chars32_126CreatePartyRequest[0].name3,
        PartyShortName: chars32_126CreatePartyRequest[0].name1.substring(0, 15),
        PartySortName: chars32_126CreatePartyRequest[0].name1.substring(0, 20),
      };

      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      givenRequestToCreatePartyExternalRatingSucceeds();
      requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
      requestToCreateParties(chars32_126AcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

      const { status, body } = await api.post(createPartyUrl, chars32_126CreatePartyRequest);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ partyIdentifier: partyIdentifier });
    });

    it('returns a 201 response when using characters with ASCII code 160 to 255, except 181 µ and 255 ÿ', async () => {
      const chars160_254CreatePartyRequest = [
        {
          ...apiCreatePartyRequest[0],
          name1: ' ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´¶·¸¹º»¼½¾¿ÀÁÂÃ', // cspell:disable-line
          name2: 'ÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæ', // cspell:disable-line
          name3: 'çèéêëìíîïðñòóôõö÷øùúûüýþ', // cspell:disable-line
        },
      ];
      const chars160_254AcbsCreatePartyRequest = {
        ...acbsCreatePartyRequest,
        PartyName1: chars160_254CreatePartyRequest[0].name1,
        PartyName2: chars160_254CreatePartyRequest[0].name2,
        PartyName3: chars160_254CreatePartyRequest[0].name3,
        PartyShortName: chars160_254CreatePartyRequest[0].name1.substring(0, 15),
        PartySortName: chars160_254CreatePartyRequest[0].name1.substring(0, 20),
      };

      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      givenRequestToCreatePartyExternalRatingSucceeds();
      requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
      requestToCreateParties(chars160_254AcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

      const { status, body } = await api.post(createPartyUrl, chars160_254CreatePartyRequest);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ partyIdentifier: partyIdentifier });
    });

    it('returns a 400 response if the request has unsupported characters', async () => {
      const invalidCreatePartyRequest = [{ ...apiCreatePartyRequest[0], name1: textWithUnsupportedBodyCharacters }];

      const { status, body } = await api.post(createPartyUrl, invalidCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        message: 'Bad request',
        error: `Field name1 has invalid characters ${expectedUnsupportedBodyCharacters}.`,
        statusCode: 400,
      });
    });
  });

  const requestToGetPartiesBySearchText = (search): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/Search/${search}`).matchHeader('authorization', `Bearer ${idToken}`);

  const requestToGetParty = () => nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/${partyIdentifier}`).matchHeader('authorization', `Bearer ${idToken}`);

  const requestToCreateParties = (request: AcbsCreatePartyRequest): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post('/Party', JSON.stringify(request))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const requestToCreatePartyExternalRating = (request: AcbsCreatePartyExternalRatingRequestDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Party/${partyIdentifier}/PartyExternalRating`, JSON.stringify(request))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenRequestToGetPartyExternalRatingsSucceeds = (): nock.Scope => {
    return requestToGetPartyExternalRatings().reply(200, []);
  };

  const requestToGetPartyExternalRatings = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/${partyIdentifier}/PartyExternalRating`).matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToCreatePartyExternalRatingSucceeds = (): nock.Scope => {
    return requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(201);
  };
});
