import request from 'supertest';

export const withNonEmptyObjectRequestValidationApiTests = ({
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: {
  makeRequest: (body: string | object) => request.Test;
  givenAnyRequestBodyWouldSucceed: () => void;
}) => {
  it('returns a 400 response if the request body is the empty object', async () => {
    givenAnyRequestBodyWouldSucceed();

    const { status, body } = await makeRequest({});

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'The request body cannot be the empty object.', error: 'Bad Request', statusCode: 400 });
  });

  it('returns a 400 response if the request body is an array', async () => {
    givenAnyRequestBodyWouldSucceed();

    const { status, body } = await makeRequest([{ x: 1 }]);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'The request body cannot be an array.', error: 'Bad Request', statusCode: 400 });
  });

  it('returns a 400 response if the request body is a string', async () => {
    givenAnyRequestBodyWouldSucceed();

    const { status } = await makeRequest('test string');

    expect(status).toBe(400);
  });

  it('returns a 400 response if the request body is a number', async () => {
    givenAnyRequestBodyWouldSucceed();

    const { status } = await makeRequest(JSON.stringify(2));

    expect(status).toBe(400);
  });

  it('returns a 400 response if the request body is null', async () => {
    givenAnyRequestBodyWouldSucceed();

    const { status } = await makeRequest(null);

    expect(status).toBe(400);
  });

  it('returns a 400 response if the request body is the boolean value true', async () => {
    givenAnyRequestBodyWouldSucceed();

    const { status } = await makeRequest(JSON.stringify(true));

    expect(status).toBe(400);
  });

  it('returns a 400 response if the request body is the boolean value false', async () => {
    givenAnyRequestBodyWouldSucceed();

    const { status } = await makeRequest(JSON.stringify(false));

    expect(status).toBe(400);
  });
};
