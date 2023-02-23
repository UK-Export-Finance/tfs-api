import { AcbsAuthenticationFailedException } from "../../../src/modules/acbs/acbs-authentication-failed.exception";

describe('AcbsAuthenticationFailedException', () => {
    it('exposes the message it was created with', () => {
        const message = 'a message';

        const exception = new AcbsAuthenticationFailedException(message);

        expect(exception.message).toBe(message);
    });

    it('exposes the name of the exception', () => {
        const exception = new AcbsAuthenticationFailedException('');

        expect(exception.name).toBe('AcbsAuthenticationFailedException');
    });

    it('exposes the inner error it was created with', () => {
        const innerError = new Error();

        const exception = new AcbsAuthenticationFailedException('', innerError);

        expect(exception.innerError).toBe(innerError);
    });
});