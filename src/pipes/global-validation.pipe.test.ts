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
    it('skips global validation and returns the value unchanged, even with extra, non-whitelisted properties', async () => {
      const value = { requiredField: 'some-value', extraField: 'should not be stripped or rejected here' };

      const result = await pipe.transform(value, bodyMetadataFor(FlexibleTestDto));

      expect(result).toBe(value);
    });

    it('does not throw even if required fields are missing (route-specific pipe is responsible for that)', async () => {
      const value = { extraField: 'only extra fields' };

      const result = await pipe.transform(value, bodyMetadataFor(FlexibleTestDto));

      expect(result).toBe(value);
    });
  });

  describe('when the body DTO is NOT marked with @FlexibleValidation', () => {
    it('strips unknown properties and rejects non-whitelisted properties (forbidNonWhitelisted)', async () => {
      const value = { requiredField: 'some-value', extraField: 'should be forbidden' };

      await expect(pipe.transform(value, bodyMetadataFor(StrictTestDto))).rejects.toBeInstanceOf(BadRequestException);
    });

    it('still validates required fields', async () => {
      const value = {};

      await expect(pipe.transform(value, bodyMetadataFor(StrictTestDto))).rejects.toBeInstanceOf(BadRequestException);
    });

    it('transforms and returns a valid payload', async () => {
      const value = { requiredField: 'some-value' };

      const result = await pipe.transform(value, bodyMetadataFor(StrictTestDto));

      expect(result).toBeInstanceOf(StrictTestDto);
      expect(result).toEqual({ requiredField: 'some-value' });
    });
  });

  describe('when there is no metatype on the metadata', () => {
    it('does not throw and falls back to the underlying ValidationPipe behaviour', async () => {
      const value = 'a-plain-string';

      const result = await pipe.transform(value, { type: 'param' });

      expect(result).toBe(value);
    });
  });
});
