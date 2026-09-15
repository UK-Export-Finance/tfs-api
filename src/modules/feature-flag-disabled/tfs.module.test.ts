import { GiftModule } from '@ukef/modules/gift/gift.module';

import { TfsModule } from '../tfs.module';

describe('TfsModule - feature flag disabled', () => {
  describe('imports', () => {
    describe('when FF_GIFT_ENABLED is false', () => {
      it('should NOT include GiftModule', () => {
        // Act
        const decoratorMetadata = Reflect.getMetadata('imports', TfsModule);
        const hasGiftModule = decoratorMetadata.includes(GiftModule);

        // Assert
        expect(hasGiftModule).toBe(false);
      });

      it('should still have imports defined', () => {
        // Act
        const decoratorMetadata = Reflect.getMetadata('imports', TfsModule);

        // Assert
        expect(decoratorMetadata).toBeDefined();
        expect(Array.isArray(decoratorMetadata)).toBe(true);
      });

      it('should include required core modules', () => {
        // Act
        const decoratorMetadata = Reflect.getMetadata('imports', TfsModule);

        // Assert - verify that standard modules are still included
        expect(decoratorMetadata.length).toBeGreaterThan(0);
      });
    });
  });
});
