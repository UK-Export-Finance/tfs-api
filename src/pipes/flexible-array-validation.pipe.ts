import { Injectable, ValidationPipe, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

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

  async transform(value: any, metadata: any) {
    if (!Array.isArray(value)) {
      return await super.transform(value, metadata);
    }

    const { items: itemType } = this.options;
    const transformedItems: any[] = [];
    const allErrors: string[] = [];

    for (let index = 0; index < value.length; index++) {
      const item = value[index];

      try {
        // Create instance from the DTO class
        const instance = plainToInstance(itemType, item);

        // Validate the instance
        const errors = await validate(instance, {
          skipMissingProperties: false,
          forbidUnknownValues: false, // Key: don't forbid unknown values
        });

        if (errors.length > 0) {
          errors.forEach((error) => {
            const messages = Object.values(error.constraints ?? {});
            allErrors.push(...messages);
          });
        }

        transformedItems.push(instance);
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
