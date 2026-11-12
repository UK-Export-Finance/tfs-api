import { Body, ValidationPipe } from '@nestjs/common';

/**
 * Similar to @Body() but with forbidNonWhitelisted set to false,
 * allowing extra properties that don't match the DTO.
 * This is useful for endpoints that may receive data from multiple sources
 * (e.g., GIFT, direct API calls) with varying field sets.
 * Extra properties are still stripped by whitelist: true.
 */
export const FlexibleValidatedBody = () =>
  Body(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: false, // but don't fail validation if they're present
      transform: true,
    }),
  );
