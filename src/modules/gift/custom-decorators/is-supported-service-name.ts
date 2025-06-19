import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

import { isSupportedServiceName } from '../helpers';

interface ObjectWithServiceName {
  serviceName: string;
}

interface ServiceNameValidationArguments extends ValidationArguments {
  object: ObjectWithServiceName;
}

/**
 * Custom decorator to check if a provided service name is supported.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function IsSupportedServiceName(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedServiceName',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(serviceName) {
          /**
           * Only check if a service name is supported, if a string is provided.
           * Otherwise, we know that the provided value, is not in the correct format and will therefore not be supported.
           * By doing this we ensure that:
           * 1) A consumer of this API receives only relevant validation errors, e.g "must be provided" OR "serviceName is not supported", not both.
           */
          if (typeof serviceName === 'string') {
            return isSupportedServiceName(serviceName);
          }

          /**
           * An invalid serviceName format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to check if the (incorrectly formatted) serviceName is supported.
           */
          return true;
        },
        defaultMessage(args: ServiceNameValidationArguments) {
          const { serviceName } = args.object;

          return `serviceName is not supported (${serviceName})`;
        },
      },
    });
  };
}
