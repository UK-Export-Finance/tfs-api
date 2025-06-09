import { GIFT } from '@ukef/constants';
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { PinoLogger } from 'nestjs-pino';

import { GiftCounterpartyService } from '../gift.counterparty.service';
import { GiftHttpService } from '../gift.http.service';
import { arrayOfObjectsHasValue } from '../helpers';

const {
  VALIDATION: {
    COUNTERPARTY: {
      ROLE_ID: { MIN_LENGTH, MAX_LENGTH },
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
 * Custom decorator to check if a provided counterparty role, is a supported role in GIFT.
 * @param {ValidationOptions} options: Class validator's validation options
 * @returns {Boolean | string}
 */
export function isSupportedCounterpartyRole(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSupportedCounterpartyRole',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        async validate(providedRoleId) {
          const isValidLength = providedRoleId?.length >= MIN_LENGTH && providedRoleId?.length <= MAX_LENGTH;

          const isValidRoleIdFormat = typeof providedRoleId === 'string' && isValidLength;

          if (isValidRoleIdFormat) {
            const logger = new PinoLogger({});
            const httpService = new GiftHttpService(logger);
            const counterpartyService = new GiftCounterpartyService(httpService, logger);

            const { data: roles } = await counterpartyService.getAllRoles();

            const isSupportedRoleId = arrayOfObjectsHasValue(roles, 'id', providedRoleId);

            return isSupportedRoleId;
          }

          return true;
        },
        defaultMessage(args: RoleIdValidationArguments) {
          const { roleId: providedRoleId } = args.object;

          return `roleId is not supported (${providedRoleId})`;
        },
      },
    });
  };
}
