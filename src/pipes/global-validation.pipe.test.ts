import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { FlexibleValidation } from '@ukef/decorators/flexible-validation.decorator';

import { GlobalValidationPipe } from './global-validation.pipe';

@FlexibleValidation()
class FlexibleTestDto {
  @IsString()
  @IsNotEmpty()
  readonly requiredField!: string;
}

class StrictTestDto {
  @IsString()
  @IsNotEmpty()
  readonly requiredField!: string;
}

describe('GlobalValidationPipe', () => {
  let pipe: GlobalValidationPipe;

  beforeEach(() => {
    pipe = new GlobalValidationPipe();
  });

  const bodyMetadataFor = (metatype: any): ArgumentMetadata => ({ type: 'body', metatype });

  describe('when the body DTO is marked with @FlexibleValidation', () => {
    it('should skip global validation and returns the value unchanged, even with extra, non-whitelisted properties', async () => {
      // Arrange
      const value = { requiredField: 'some-value', extraField: 'should not be stripped or rejected here' };

      // Act
      const result = await pipe.transform(value, bodyMetadataFor(FlexibleTestDto));

      // Assert
      expect(result).toBe(value);
    });

    it('should not throw even if required fields are missing (route-specific pipe is responsible for that)', async () => {
      // Arrange
      const value = { extraField: 'only extra fields' };

      // Act
      const result = await pipe.transform(value, bodyMetadataFor(FlexibleTestDto));

      // Assert
      expect(result).toBe(value);
    });
  });

  describe('when the body is an array (e.g. amendment bundle endpoints)', () => {
    it('should skip global validation and return the value unchanged, even with extra, non-whitelisted properties on the items', async () => {
      /**
       * Arrange: TypeScript's reflected metadata for an array-typed @Body() parameter is
       * always the generic `Array` constructor, never the item DTO class, so this pipe
       * cannot look up a @FlexibleValidation marker on the item type. It must explicitly
       * defer to the route-specific pipe (e.g. FlexibleArrayValidationPipe) instead.
       */
      const value = [{ requiredField: 'some-value', extraField: 'should not be stripped or rejected here' }];

      // Act
      const result = await pipe.transform(value, bodyMetadataFor(Array));

      // Assert
      expect(result).toBe(value);
    });

    it('should not throw even if required fields are missing on the items (route-specific pipe is responsible for that)', async () => {
      // Arrange
      const value = [{ extraField: 'only extra fields' }];

      // Act
      const result = await pipe.transform(value, bodyMetadataFor(Array));

      // Assert
      expect(result).toBe(value);
    });
  });

  describe('when the body DTO is NOT marked with @FlexibleValidation', () => {
    it('strips unknown properties and rejects non-whitelisted properties (forbidNonWhitelisted)', async () => {
      // Arrange
      const value = { requiredField: 'some-value', extraField: 'should be forbidden' };

      // Act & Assert
      await expect(pipe.transform(value, bodyMetadataFor(StrictTestDto))).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should still validate required fields', async () => {
      // Arrange
      const value = {};

      // Act & Assert
      await expect(pipe.transform(value, bodyMetadataFor(StrictTestDto))).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should transform and return a valid payload', async () => {
      // Arrange
      const value = { requiredField: 'some-value' };

      // Act
      const result = await pipe.transform(value, bodyMetadataFor(StrictTestDto));

      // Assert
      expect(result).toBeInstanceOf(StrictTestDto);
      expect(result).toEqual({ requiredField: 'some-value' });
    });
  });

  describe('when there is no metatype on the metadata', () => {
    it('should not throw and falls back to the underlying ValidationPipe behaviour', async () => {
      // Arrange
      const value = 'a-plain-string';

      // Act
      const result = await pipe.transform(value, { type: 'param' });

      // Assert
      expect(result).toBe(value);
    });
  });
});
