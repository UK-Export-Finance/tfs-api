import { GIFT } from '@ukef/constants';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { isValidCounterpartyRoleIdFormat, validateCounterpartySharePercentage } from '../helpers';
import { GiftCounterpartyService, GiftHttpService } from '../services';

const {
  VALIDATION: {
    COUNTERPARTY: {
      SHARE_PERCENTAGE: { MIN, MAX },
    },
  },
} = GIFT;

interface ObjectWithRoleId {
  roleCode: string;
}

interface RoleIdValidationArguments extends ValidationArguments {
  object: ObjectWithRoleId;
}

/**
 * Custom decorator to conditionally validate a counterparty sharePercentage,
 * If the provided counterparty role (roleCode) requires a sharePercentage.
 * NOTE: This validation has to be in a custom decorator due to class-validator limitations:
 * 1) IsOptional cannot be used - this ignores all other validators.
 * 2) ValidateIf cannot be used - this does not allow for async calls:
 * Therefore, the only way to achieve conditional async validation, is to have our own custom decorator.
 * https://github.com/typestack/class-validator/issues/733
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function CounterpartySharePercentageValidation(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'CounterpartySharePercentageValidation',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        async validate(providedSharePercentage, args: RoleIdValidationArguments) {
          /**
           * Only check counterparty sharePercentage validation, if a counterparty roleCode is provided.
           * Otherwise, we know that there will be no matching role and therefore a sharePercentage cannot be required.
           * By doing this we ensure that we only call the GIFT API's counterparty roles endpoint, if we have a correctly formatted roleCode.
           */
          const { roleCode: providedRoleId } = args.object;

          if (isValidCounterpartyRoleIdFormat(providedRoleId)) {
            const logger = new PinoLogger({});
            const httpService = new GiftHttpService(logger);
            const counterpartyService = new GiftCounterpartyService(httpService, logger);

            const { data: rolesResponse } = await counterpartyService.getAllRoles();

            return validateCounterpartySharePercentage({
              roles: rolesResponse?.counterpartyRoles,
              roleCode: providedRoleId,
              sharePercentage: providedSharePercentage,
            });
          }

          /**
           * An invalid roleCode format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to call GIFT to check if the (incorrectly formatted) roleCode requires a sharePercentage.
           */
          return true;
        },
        defaultMessage() {
          return `sharePercentage must be a provided as a number, at least ${MIN} and not greater than ${MAX}`;
        },
      },
    });
  };
}
