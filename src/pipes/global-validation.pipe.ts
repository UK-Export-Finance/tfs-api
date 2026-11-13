import { Injectable, ValidationPipe } from '@nestjs/common';
import { FLEXIBLE_VALIDATION } from '@ukef/decorators/flexible-validation.decorator';

/**
 * Global validation pipe that applies forbidNonWhitelisted: true to all routes
 * EXCEPT routes whose body DTO is marked with @FlexibleValidation, which use
 * route-specific flexible pipes instead.
 *
 * This allows amendment endpoints to receive requests with varying field sets
 * from different sources (e.g., GIFT, direct API calls).
 */
@Injectable()
export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  }

  async transform(value: any, metadata: any) {
    // Check if the parameter's DTO (metatype) is marked with @FlexibleValidation.
    // ArgumentMetadata only exposes `metatype`, not the controller/handler, so
    // the decorator must be applied to the DTO class rather than the route handler.
    if (metadata?.metatype && Reflect.getMetadata(FLEXIBLE_VALIDATION, metadata.metatype)) {
      // Skip global strict validation for flexible routes (ACBS)
      // They will be validated by their route-specific flexible pipes
      return value;
    }

    // Apply strict global validation for all other routes
    return await super.transform(value, metadata);
  }
}
