import { Injectable, PipeTransform, ValidationPipe } from '@nestjs/common';

/**
 * Flexible validation pipe for single-object request bodies.
 * Sets forbidNonWhitelisted to false, allowing extra properties that don't
 * match the DTO. This is useful for endpoints that may receive data from
 * multiple sources (e.g., GIFT, direct API calls) with varying field sets.
 * Extra properties are still stripped by whitelist: true.
 *
 * Use with: @UsePipes(new FlexibleValidationPipe())
 */
@Injectable()
export class FlexibleValidationPipe extends ValidationPipe implements PipeTransform {
  constructor() {
    super({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: false, // but don't fail validation if they're present
      transform: true,
    });
  }
}
