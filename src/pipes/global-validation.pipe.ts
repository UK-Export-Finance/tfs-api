import { Injectable, ValidationPipe } from '@nestjs/common';
import { FLEXIBLE_VALIDATION } from '@ukef/decorators/flexible-validation.decorator';

/**
 * Global validation pipe that applies forbidNonWhitelisted: true to all routes
 * EXCEPT:
 * - routes whose body DTO is marked with @FlexibleValidation, and
 * - array-body routes (e.g. amendment bundles), whose items are validated by
 *   their own route-specific pipe (e.g. FlexibleArrayValidationPipe or
 *   ParseArrayPipe via @ValidatedArrayBody).
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
    /**
     * Array-bodied routes (e.g. POST .../amendments/amount) are always
     * validated item-by-item by their own route-specific pipe. TypeScript's
     * reflected "design:paramtypes" metadata for an array-typed parameter is
     * always the generic `Array` constructor - it never resolves to the item
     * DTO class - so there is no way to look up a @FlexibleValidation marker
     * on the item type from here. Explicitly skip global strict validation for
     * these routes so extra fields reliably reach the route-specific pipe,
     * rather than relying on the underlying ValidationPipe's own (undocumented
     * from this class's perspective) handling of `Array` metatypes.
     */
    if (metadata?.metatype === Array) {
      return value;
    }

    /**
     * Check if the parameter's DTO (metatype) is marked with @FlexibleValidation.
     * ArgumentMetadata only exposes `metatype`, not the controller/handler, so
     * the decorator must be applied to the DTO class rather than the route handler.
     */
    if (metadata?.metatype && Reflect.getMetadata(FLEXIBLE_VALIDATION, metadata.metatype)) {
      /**
       * Skip global strict validation for flexible routes.
       * These routes will be validated by their route-specific flexible pipes.
       */
      return value;
    }

    // Apply strict global validation for all other routes
    return await super.transform(value, metadata);
  }
}
