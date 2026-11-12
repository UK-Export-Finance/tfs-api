import { Injectable, ValidationPipe, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, getMetadataStorage } from 'class-validator';

type Options = {
  items: any;
};

/**
 * Flexible validation pipe for array request bodies.
 * Sets forbidNonWhitelisted to false, allowing extra properties in array items
 * that don't match the DTO. This is useful for endpoints that may receive data
 * from multiple sources (e.g., GIFT, direct API calls) with varying field sets.
 * Extra properties are still stripped by whitelist: true.
 *
 * Use with: @UsePipes(new FlexibleArrayValidationPipe({ items: MyDTO }))
 */
@Injectable()
export class FlexibleArrayValidationPipe extends ValidationPipe {
  constructor(private readonly options: Options) {
    super({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  }

  private getValidDTOKeys(itemType: any): Set<string> {
    // Get all property names that have validation decorators on the DTO
    const metadata = getMetadataStorage();
    const constraintMetadata = metadata.getTargetValidationMetadatas(itemType, '', false, false);

    return new Set(constraintMetadata.map((meta) => meta.propertyName));
  }

  async transform(value: any, metadata: any) {
    // Only validate body parameters - skip other metadata types
    if (metadata?.type !== 'body') {
      return value;
    }

    // Reject non-array bodies - this endpoint expects an array
    if (!Array.isArray(value)) {
      throw new BadRequestException('Validation failed (parsable array expected)');
    }

    const { items: itemType } = this.options;
    const transformedItems: any[] = [];
    const allErrors: string[] = [];
    const validDTOKeys = this.getValidDTOKeys(itemType);

    for (let index = 0; index < value.length; index++) {
      const item = value[`${index}`];

      // Validate that each item is a non-null, non-array object
      if (item === null || item === undefined) {
        allErrors.push(`Item at index ${index} is null or undefined`);
        continue;
      }

      if (Array.isArray(item)) {
        allErrors.push(`Item at index ${index} must be an object, not an array`);
        continue;
      }

      if (typeof item !== 'object') {
        allErrors.push(`Item at index ${index} must be an object, received ${typeof item}`);
        continue;
      }

      try {
        // Create instance from the DTO class (keep all properties initially)
        const instance = plainToInstance(itemType, item);

        // Validate the instance
        const errors = await validate(instance, {
          skipMissingProperties: false,
          forbidUnknownValues: false, // Allow unknown values during validation
        });

        if (errors.length > 0) {
          errors.forEach((error) => {
            const messages = Object.values(error.constraints ?? {});
            allErrors.push(...messages);
          });
        }

        // Strip extra properties: keep only those defined in the DTO
        const strippedInstance: any = {};
        validDTOKeys.forEach((key) => {
          if (key in instance) {
            strippedInstance[`${key}`] = instance[`${key}`];
          }
        });

        transformedItems.push(strippedInstance);
      } catch (error) {
        throw new BadRequestException('Invalid array item');
      }
    }

    if (allErrors.length > 0) {
      throw new BadRequestException(allErrors);
    }

    return transformedItems;
  }
}
