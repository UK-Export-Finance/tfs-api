import { GIFT } from '@ukef/constants';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { GiftFacilityCounterpartyRoleDto } from '../dto';
import { GiftCounterpartyService } from '../gift.counterparty.service';
import { GiftHttpService } from '../gift.http.service';
import { isValidCounterpartyRoleIdFormat } from '../helpers';

const {
  VALIDATION: {
    COUNTERPARTY: {
      SHARE_PERCENTAGE: { MIN, MAX },
    },
  },
} = GIFT;

interface ObjectWithRoleId {
  roleId: string;
}

interface RoleIdValidationArguments extends ValidationArguments {
  object: ObjectWithRoleId;
}

/**
 * Custom decorator to conditionally validate a counterparty sharePercentage,
 * If the provided counterparty role (roleId) requires a sharePercentage.
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
           * Only check counterparty sharePercentage validation, if a counterparty roleId is provided.
           * Otherwise, we know that there will be no matching role and therefore a sharePercentage cannot be required.
           * By doing this we ensure that:
           * 1) We only call the GIFT API's counterparty roles endpoint, if we have a correctly formatted roleId.
           * 2) A consumer of this API receives only relevant validation errors, e.g "must be provided/X length" OR "roleId is not supported", not both.
           */
          const { roleId: providedRoleId } = args.object;

          if (isValidCounterpartyRoleIdFormat(providedRoleId)) {
            const logger = new PinoLogger({});
            const httpService = new GiftHttpService(logger);
            const counterpartyService = new GiftCounterpartyService(httpService, logger);

            const { data: roles } = await counterpartyService.getAllRoles();

            // TODO
            // TODO: move below into a helper?

            const role = roles.find((role: GiftFacilityCounterpartyRoleDto) => role.id === providedRoleId);

            /**
             * No role has been found.
             * Therefore, the role does not require a sharePercentage.
             */
            if (!role) {
              return true;
            }

            /**
             * The role does not require a share.
             * Therefore, no need to validate further.
             */
            if (!role.hasShare) {
              return true;
            }

            /**
             * The role requires a share.
             * Therefore, validate the provided sharePercentage.
             */
            if (typeof providedSharePercentage !== 'number' || providedSharePercentage < MIN || providedSharePercentage > MAX) {
              return false;
            }
          }

          /**
           * An invalid roleId format has been provided - other validation errors from the controller will be surfaced.
           * Therefore, no need to call GIFT to check if the (incorrectly formatted) roleId requires a sharePercentage.
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
