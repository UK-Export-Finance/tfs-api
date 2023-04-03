import { HttpService } from '@nestjs/axios';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsCreatePartyRequest } from './dto/acbs-create-party-request.dto';
import { CreatePartyInAcbsFailedException } from './exception/create-party-in-acbs-failed.exception';
import { PartyService } from './party.service';

jest.mock('@ukef/modules/acbs/acbs-party.service');
jest.mock('@ukef/modules/acbs-authentication/acbs-authentication.service');

describe('PartyService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();

  let httpService: HttpService;
  let partyService: PartyService;

  let httpServicePost: jest.Mock;

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    partyService = new PartyService({ baseUrl }, httpService, null, null, new DateStringTransformations());
  });

  describe('createParty', () => {
    const getExpectedCreatePartyArguments = (request: AcbsCreatePartyRequest): [string, object, object] => [
      '/Party',
      request,
      {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      },
    ];

    const { acbsCreatePartyRequest, createPartyRequest } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({
      numberToGenerate: 1,
    });
    const createPartyRequestItem = createPartyRequest[0];

    it('returns the identifier of the new party if the request is successful', async () => {
      mockSuccessfulAcbsCreatePartyRequest(acbsCreatePartyRequest, '00000000');

      const response = await partyService.createParty(idToken, createPartyRequestItem);

      expect(response).toStrictEqual({
        partyIdentifier: '00000000',
      });
    });

    it('throws a CreatePartyInAcbsFailedException if there is an error when creating the party in ACBS', async () => {
      const createPartyError = new AxiosError();

      when(httpServicePost)
        .calledWith(...getExpectedCreatePartyArguments(acbsCreatePartyRequest))
        .mockReturnValueOnce(throwError(() => createPartyError));

      const responsePromise = partyService.createParty(idToken, createPartyRequestItem);

      await expect(responsePromise).rejects.toBeInstanceOf(CreatePartyInAcbsFailedException);
      await expect(responsePromise).rejects.toThrow('Failed to create party in ACBS.');
      await expect(responsePromise).rejects.toHaveProperty('innerError', createPartyError);
    });

    function mockSuccessfulAcbsCreatePartyRequest(request: AcbsCreatePartyRequest, partyIdentifier: string): void {
      when(httpServicePost)
        .calledWith(...getExpectedCreatePartyArguments(request))
        .mockReturnValueOnce(
          of({
            data: undefined,
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: {
              location: `/Party/${partyIdentifier}`,
            },
          }),
        );
    }
  });
});
