import { VALIDATION } from '@ukef/constants/gift/validation.constant';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { GiftCurrencyService } from '../gift.currency.service';
import { GiftHttpService } from '../gift.http.service';
import { arrayContainsString } from '../helpers';

interface ObjectWithCurrency {
  currency: string;
}

interface CurrencyValidationArguments extends ValidationArguments {
  object: ObjectWithCurrency;
}

/**
 * Custom decorator to check if a provided currency, is a supported currency in GIFT.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function IsSupportedCurrency(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedCurrency',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        async validate(currency) {
          /**
           * Only check if a currency is supported, if a string with the correct length is provided.
           * Otherwise, we know that the provided value, is not in the correct format and will therefore not be supported.
           * By doing this we ensure that:
           * 1) We only call the GIFT API's currency endpoint, if we have a correctly formatted currency.
           * 2) A consumer of this API receives only relevant validation errors, e.g "must be provided/X length" OR "currency is not supported", not both.
           */
          const isValidCurrencyFormat = typeof currency === 'string' && currency.length === VALIDATION.CURRENCY.MIN_LENGTH;

          if (isValidCurrencyFormat) {
            const logger = new PinoLogger({});
            const httpService = new GiftHttpService(logger);
            const currencyService = new GiftCurrencyService(httpService, logger);

            const supportedCurrencies = await currencyService.getSupportedCurrencies();

            const isSupportedCurrency = arrayContainsString(supportedCurrencies.data, currency);

            return isSupportedCurrency;
          }

          /**
           * An invalid currency format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to call GIFT to check if the (incorrectly formatted) currency is supported.
           */
          return true;
        },
        defaultMessage(args: CurrencyValidationArguments) {
          const { currency } = args.object;

          return `currency is not supported (${currency})`;
        },
      },
    });
  };
}
