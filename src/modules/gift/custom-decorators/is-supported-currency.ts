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
      propertyName: propertyName,
      options,
      validator: {
        async validate(providedCurrency) {
          if (providedCurrency) {
            const httpService = new GiftHttpService();
            const currencyService = new GiftCurrencyService(httpService);

            const supportedCurrencies = await currencyService.getSupportedCurrencies();

            return arrayContainsString(supportedCurrencies.data, providedCurrency);
          }

          return true;
        },
        defaultMessage(args: CurrencyValidationArguments) {
          const { currency: providedCurrency } = args.object;

          return `currency is unsupported (${providedCurrency})`;
        },
      },
    });
  };
}
