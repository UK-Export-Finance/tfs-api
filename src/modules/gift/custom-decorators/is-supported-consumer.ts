import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

import { isSupportedConsumer } from '../helpers';

interface ObjectWithConsumer {
  consumer: string;
}

interface ConsumerValidationArguments extends ValidationArguments {
  object: ObjectWithConsumer;
}

/**
 * Custom decorator to check if a provided consumer is supported.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function IsSupportedConsumer(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedConsumer',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(consumer) {
          /**
           * Only check if a consumer is supported, if a string is provided.
           * Otherwise, we know that the provided value, is not in the correct format and will therefore not be supported.
           * By doing this we ensure that:
           * 1) A consumer of this API receives only relevant validation errors, e.g "must be provided" OR "consumer is not supported", not both.
           */
          if (typeof consumer === 'string') {
            return isSupportedConsumer(consumer);
          }

          /**
           * An invalid consumer format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to check if the (incorrectly formatted) consumer is supported.
           */
          return true;
        },
        defaultMessage(args: ConsumerValidationArguments) {
          const { consumer } = args.object;

          return `consumer is not supported (${consumer})`;
        },
      },
    });
  };
}
