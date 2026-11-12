import { Body, ParseArrayPipe, ParseArrayOptions } from '@nestjs/common';

type Options = Pick<Required<ParseArrayOptions>, 'items'>;

/**
 * Similar to @ValidatedArrayBody() but with forbidNonWhitelisted set to false,
 * allowing extra properties in array items that don't match the DTO.
 * This is useful for endpoints that may receive data from multiple sources
 * (e.g., GIFT, direct API calls) with varying field sets.
 * Extra properties are still stripped by whitelist: true.
 */
export const FlexibleValidatedArrayBody = ({ items }: Options) => Body(new ParseArrayPipe({ items, whitelist: true, forbidNonWhitelisted: false }));
