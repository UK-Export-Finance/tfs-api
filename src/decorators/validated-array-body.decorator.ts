import { Body, ParseArrayOptions, ParseArrayPipe } from '@nestjs/common';

type Options = Pick<Required<ParseArrayOptions>, 'items'>;

export const ValidatedArrayBody = ({ items }: Options) => Body(new ParseArrayPipe({ items, whitelist: true }));
