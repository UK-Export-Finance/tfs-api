import { VALIDATION } from '@ukef/constants/gift/validation.constant';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

import { GiftCurrencyService } from '../gift.currency.service';
import { GiftHttpService } from '../gift-http.service';
import { arrayContainsString } from '../helpers';

interface ObjectWithCurrency {
  currency: string;
}

interface CurrencyValidationArguments extends ValidationArguments {
  object: ObjectWithCurrency;
}

export function IsSupportedCurrency(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedCurrency',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        async validate(providedCurrency) {
          /**
           * Only validate if a currency with the correct length is provided. By doing this we ensure that:
           * 1) A consumer of the API receives only relevant validation errors, e.g "must be provided/X length" OR "currency is not supported", not both.
           * 2) We only call the GIFT currency endpoint, if we have a correctly formatted currency.
           */
          const shouldValidate = typeof providedCurrency === 'string' && providedCurrency.length === VALIDATION.CURRENCY.MIN_LENGTH;

          if (shouldValidate) {
            const httpService = new GiftHttpService();
            const currencyService = new GiftCurrencyService(httpService);

            const supportedCurrencies = await currencyService.getSupportedCurrencies();

            return arrayContainsString(supportedCurrencies.data, providedCurrency);
          }

          /**
           * An invalid currency format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to call GIFT to check if the (incorrectly formatted) currency is supported.
           */
          return true;
        },
        defaultMessage(args: CurrencyValidationArguments) {
          const { currency: providedCurrency } = args.object;

          return `currency is not supported (${providedCurrency})`;
        },
      },
    });
  };
}
