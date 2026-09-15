import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcbsExceptionTransformInterceptor } from '@ukef/modules/acbs-adapter/acbs-exception-transform.interceptor';
import { GiftModule } from '@ukef/modules/gift/gift.module';

import { TfsModule } from './tfs.module';

describe('TfsModule', () => {
  describe('imports', () => {
    it('should have imports defined', () => {
      // Act
      const decoratorMetadata = Reflect.getMetadata('imports', TfsModule);

      // Assert
      expect(decoratorMetadata).toBeDefined();
      expect(Array.isArray(decoratorMetadata)).toBe(true);
    });

    it('should include required core modules', () => {
      // Act
      const decoratorMetadata = Reflect.getMetadata('imports', TfsModule);

      // Assert - verify that standard modules are always included
      expect(decoratorMetadata.length).toBeGreaterThan(0);
    });

    describe('when FF_GIFT_ENABLED is true', () => {
      it('should include GiftModule', () => {
        // Act
        const decoratorMetadata = Reflect.getMetadata('imports', TfsModule);

        // Assert
        const hasGiftModule = decoratorMetadata.includes(GiftModule);

        expect(hasGiftModule).toBe(true);
      });
    });
  });

  describe('providers', () => {
    it('should include AcbsExceptionTransformInterceptor', () => {
      // Act
      const providers = Reflect.getMetadata('providers', TfsModule);

      // Assert
      expect(providers).toBeDefined();
      expect(providers).toContainEqual(
        expect.objectContaining({
          provide: APP_INTERCEPTOR,
          useClass: AcbsExceptionTransformInterceptor,
        }),
      );
    });
  });
});
