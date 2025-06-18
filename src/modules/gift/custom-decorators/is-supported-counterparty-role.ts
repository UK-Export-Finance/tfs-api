import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { GiftCounterpartyService } from '../gift.counterparty.service';
import { GiftHttpService } from '../gift.http.service';
import { arrayOfObjectsHasValue, isValidCounterpartyRoleIdFormat } from '../helpers';

interface ObjectWithRoleId {
  roleCode: string;
}

interface RoleIdValidationArguments extends ValidationArguments {
  object: ObjectWithRoleId;
}

/**
 * Custom decorator to check if a provided counterparty role, is a supported role in GIFT.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function IsSupportedCounterpartyRole(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsSupportedCounterpartyRole',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        async validate(providedRoleId) {
          /**
           * Only check if a counterparty roleCode is supported, if a string with the correct length is provided.
           * Otherwise, we know that the provided value, is not in the correct format and will therefore not be supported.
           * By doing this we ensure that:
           * 1) We only call the GIFT API's counterparty roles endpoint, if we have a correctly formatted roleCode.
           * 2) A consumer of this API receives only relevant validation errors, e.g "must be provided/X length" OR "roleCode is not supported", not both.
           */
          if (isValidCounterpartyRoleIdFormat(providedRoleId)) {
            const logger = new PinoLogger({});
            const httpService = new GiftHttpService(logger);
            const counterpartyService = new GiftCounterpartyService(httpService, logger);

            const { data: roles } = await counterpartyService.getAllRoles();

            const isSupportedRoleId = arrayOfObjectsHasValue(roles, 'id', providedRoleId);

            return isSupportedRoleId;
          }

          /**
           * An invalid roleCode format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to call GIFT to check if the (incorrectly formatted) roleCode is supported.
           */
          return true;
        },
        defaultMessage(args: RoleIdValidationArguments) {
          const { roleCode: providedRoleId } = args.object;

          return `roleCode is not supported (${providedRoleId})`;
        },
      },
    });
  };
}
