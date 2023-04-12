// Reflect metadata is required for partial load during unit testing.
import 'reflect-metadata';

import { HttpException } from '@nestjs/common/exceptions/http.exception';

import { AcbsNoContentException } from './acbs-no-content.exception';

describe('AcbsAuthenticationFailedException', () => {
  it('exposes the name of the exception', () => {
    const exception = new AcbsNoContentException();

    expect(exception.name).toBe('AcbsNoContentException');
  });

  it('is instance of HttpException', () => {
    expect(new AcbsNoContentException()).toBeInstanceOf(HttpException);
  });
});
