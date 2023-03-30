import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { AcbsCreatePartyRequest } from '@ukef/modules/party/dto/acbs-create-party-request.dto';
import { AcbsGetPartiesBySearchTextResponse } from '@ukef/modules/party/dto/acbs-get-parties-by-search-text-response.dto';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /parties', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();

  const partyIdentifier = valueGenerator.stringOfNumericCharacters();
  const alternateIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const tooShortAlternateIdentifier = valueGenerator.stringOfNumericCharacters({ minLength: 1, maxLength: 7 });
  const tooLongAlternateIdentifier = valueGenerator.stringOfNumericCharacters({ minLength: 9 });
  const nonDigitCharactersAlternateIdentifier = `${valueGenerator.string({ length: 7 })}a`;
  const industryClassification1Character = valueGenerator.stringOfNumericCharacters({ length: 1 });
  const industryClassification10Characters = valueGenerator.stringOfNumericCharacters({ length: 10 });
  const tooLongIndustryClassification = valueGenerator.stringOfNumericCharacters({ minLength: 11 });
  const name1Character = valueGenerator.string({ length: 1 });
  const name35Characters = valueGenerator.string({ length: 35 });
  const tooLongName = valueGenerator.string({ minLength: 36 });
  const smeType1Character = valueGenerator.stringOfNumericCharacters({ length: 1 });
  const smeType2Characters = valueGenerator.stringOfNumericCharacters({ length: 2 });
  const tooLongSmeType = valueGenerator.stringOfNumericCharacters({ minLength: 3 });
  const countryCode3Characters = valueGenerator.string({ length: 3 });
  const tooLongCountryCode = valueGenerator.string({ minLength: 4 });

  const { acbsCreatePartyRequest, createPartyRequest } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });
  acbsCreatePartyRequest.PartyAlternateIdentifier = alternateIdentifier;
  createPartyRequest[0].alternateIdentifier = alternateIdentifier;

  const { partiesInAcbs } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });
  const partiesInAcbsWithPartyIdentifiers: AcbsGetPartiesBySearchTextResponse = [
    { ...partiesInAcbs[0], PartyIdentifier: partyIdentifier },
    { ...partiesInAcbs[1], PartyIdentifier: valueGenerator.stringOfNumericCharacters() },
  ];

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
    givenRequestWouldOtherwiseSucceed: () => {
      requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
      requestToCreateParties(acbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });
    },
    makeRequest: () => api.post(`/api/v1/parties`, createPartyRequest),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
      requestToCreateParties(acbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(`/api/v1/parties`, createPartyRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(acbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', createPartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when the industryClassification is exactly 1 character', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].industryClassification = industryClassification1Character;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.IndustryClassification.IndustryClassificationCode = industryClassification1Character;

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when the industryClassification is exactly 10 characters', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].industryClassification = industryClassification10Characters;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.IndustryClassification.IndustryClassificationCode = industryClassification10Characters;

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name1 is exactly 1 character', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name1 = name1Character;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName1 = name1Character;
    validAcbsCreatePartyRequest.PartyShortName = name1Character;
    validAcbsCreatePartyRequest.PartySortName = name1Character;

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name1 is exactly 35 characters', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name1 = name35Characters;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName1 = name35Characters;
    validAcbsCreatePartyRequest.PartyShortName = name35Characters.substring(0, 15);
    validAcbsCreatePartyRequest.PartySortName = name35Characters.substring(0, 20);

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name2 is missing', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name2 = undefined;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName2 = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name2 is null', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name2 = null;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName2 = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name2 is the empty string', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name2 = '';

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName2 = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name2 is exactly 35 characters', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name2 = name35Characters;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName2 = name35Characters;

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name3 is missing', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name3 = undefined;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName3 = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name3 is null', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name3 = null;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName3 = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name3 is the empty string', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name3 = '';

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName3 = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when name3 is exactly 35 characters', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].name3 = name35Characters;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PartyName3 = name35Characters;

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when smeType is exactly 1 character', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].smeType = smeType1Character;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.MinorityClass.MinorityClassCode = smeType1Character;

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when smeType is exactly 2 characters', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].smeType = smeType2Characters;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.MinorityClass.MinorityClassCode = smeType2Characters;

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when countryCode is missing', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].countryCode = '';

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PrimaryAddress.Country.CountryCode = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when countryCode is the empty string', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].countryCode = '';

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PrimaryAddress.Country.CountryCode = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this when countryCode is exactly 3 characters', async () => {
    const validCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    validCreatePartyRequest[0].countryCode = countryCode3Characters;

    const validAcbsCreatePartyRequest = JSON.parse(JSON.stringify(acbsCreatePartyRequest));
    validAcbsCreatePartyRequest.PrimaryAddress.Country.CountryCode = countryCode3Characters;

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(validAcbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', validCreatePartyRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier: partyIdentifier })));
  });

  it('returns a 200 response with the identifier of the first matching party if ACBS returns one or more matching parties when using the alternate identifier as search text', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, partiesInAcbsWithPartyIdentifiers);

    const { status, body } = await api.post('/api/v1/parties', createPartyRequest);

    expect(status).toBe(200);
    expect(body).toStrictEqual({ partyIdentifier: partyIdentifier });
  });

  it("returns a 200 response with an empty object if ACBS returns one or more matching parties when using the alternate identifier as search text but the first matching party's PartyIdentifier is equal to the empty string", async () => {
    const partiesInAcbsWithEmptyPartyIdentifier = JSON.parse(JSON.stringify(partiesInAcbsWithPartyIdentifiers));
    partiesInAcbsWithEmptyPartyIdentifier[0].PartyIdentifier = '';

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, partiesInAcbsWithEmptyPartyIdentifier);

    const { status, body } = await api.post('/api/v1/parties', createPartyRequest);

    expect(status).toBe(200);
    expect(body).toStrictEqual({});
  });

  it('returns a 500 response if ACBS GET Party by search text returns a status code that is not 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(401);

    const { status, body } = await api.post('/api/v1/parties', createPartyRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS POST Party returns a status code that is not 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(acbsCreatePartyRequest).reply(401);

    const { status, body } = await api.post('/api/v1/parties', createPartyRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the parties from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).delay(1500).reply(200, []);
    requestToCreateParties(acbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', createPartyRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if posting the party to ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
    requestToCreateParties(acbsCreatePartyRequest)
      .delay(1500)
      .reply(201, undefined, { Location: `/Party/${partyIdentifier}` });

    const { status, body } = await api.post('/api/v1/parties', createPartyRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 400 response if the alternateIdentifier is missing', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].alternateIdentifier = undefined;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['alternateIdentifier must only contain digits', 'alternateIdentifier must be exactly 8 characters'],
    });
  });

  it('returns a 400 response if the alternateIdentifier is less than 8 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].alternateIdentifier = tooShortAlternateIdentifier;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['alternateIdentifier must be exactly 8 characters'],
    });
  });

  it('returns a 400 response if the alternateIdentifier is more than 8 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].alternateIdentifier = tooLongAlternateIdentifier;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['alternateIdentifier must be exactly 8 characters'],
    });
  });

  it('returns a 400 response if the alternateIdentifier contains non-digit characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].alternateIdentifier = nonDigitCharactersAlternateIdentifier;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['alternateIdentifier must only contain digits'],
    });
  });

  it('returns a 400 response if the industryClassification is missing', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].industryClassification = undefined;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['industryClassification must be longer than or equal to 1 characters'],
    });
  });

  it('returns a 400 response if the industryClassification is less than 1 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].industryClassification = '';

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['industryClassification must be longer than or equal to 1 characters'],
    });
  });

  it('returns a 400 response if the industryClassification is more than 10 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].industryClassification = tooLongIndustryClassification;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['industryClassification must be shorter than or equal to 10 characters'],
    });
  });

  it('returns a 400 response if name1 is missing', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].name1 = undefined;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['name1 must be longer than or equal to 1 characters'],
    });
  });

  it('returns a 400 response if name1 is less than 1 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].name1 = '';

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['name1 must be longer than or equal to 1 characters'],
    });
  });

  it('returns a 400 response if name1 is more than 35 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].name1 = tooLongName;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['name1 must be shorter than or equal to 35 characters'],
    });
  });

  it('returns a 400 response if name2 is more than 35 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].name2 = tooLongName;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['name2 must be shorter than or equal to 35 characters'],
    });
  });

  it('returns a 400 response if name3 is more than 35 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].name3 = tooLongName;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['name3 must be shorter than or equal to 35 characters'],
    });
  });

  it('returns a 400 response if the smeType is missing', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].smeType = undefined;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['smeType must be longer than or equal to 1 characters'],
    });
  });

  it('returns a 400 response if the smeType is less than 1 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].smeType = '';

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['smeType must be longer than or equal to 1 characters'],
    });
  });

  it('returns a 400 response if the smeType is more than 2 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].smeType = tooLongSmeType;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['smeType must be shorter than or equal to 2 characters'],
    });
  });

  it('returns a 400 response if the citizenshipClass is missing', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].citizenshipClass = undefined;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['citizenshipClass must be one of the following values: 1, 2', 'citizenshipClass must be a string'],
    });
  });

  it('returns a 400 response if the citizenshipClass is not a string', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].citizenshipClass = 1;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['citizenshipClass must be one of the following values: 1, 2', 'citizenshipClass must be a string'],
    });
  });

  it('returns a 400 response if the citizenshipClass is not 1 or 2', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].citizenshipClass = '3';

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['citizenshipClass must be one of the following values: 1, 2'],
    });
  });

  it('returns a 400 response if the officerRiskDate is missing', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].officerRiskDate = undefined;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['officerRiskDate must be longer than or equal to 0 characters', 'officerRiskDate must be a valid ISO 8601 date string'],
    });
  });

  it('returns a 400 response if the officerRiskDate is an empty string', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].officerRiskDate = '';

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['officerRiskDate must be a valid ISO 8601 date string'],
    });
  });

  it('returns a 400 response if the officerRiskDate is in the format YYYY-MM-DDT00:00:00Z', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].officerRiskDate += 'T00:00:00Z';

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['officerRiskDate must be shorter than or equal to 10 characters'],
    });
  });

  it('returns a 400 response if the countryCode is more than 3 characters', async () => {
    const invalidCreatePartyRequest = JSON.parse(JSON.stringify(createPartyRequest));
    invalidCreatePartyRequest[0].countryCode = tooLongCountryCode;

    const { status, body } = await api.post('/api/v1/parties', invalidCreatePartyRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['countryCode must be shorter than or equal to 3 characters'],
    });
  });

  const requestToGetPartiesBySearchText = (searchText: string): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/Search/${searchText}`).matchHeader('authorization', `Bearer ${idToken}`);

  const requestToCreateParties = (request: AcbsCreatePartyRequest): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post('/Party', JSON.stringify(request))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');
});
