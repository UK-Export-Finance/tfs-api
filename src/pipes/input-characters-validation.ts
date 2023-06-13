import { ArgumentMetadata, BadRequestException, HttpExceptionOptions, Injectable, InternalServerErrorException, PipeTransform } from '@nestjs/common';
import { ACBS } from '@ukef/constants';

@Injectable()
export class InputCharacterValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.type === 'query' || metadata.type === 'param') {
      this.recursiveCheck(
        value,
        ACBS.URL_ALLOWED_CHARACTERS_REGEX,
        (key, invalidCharacters) => `URL field ${key} has invalid characters ${invalidCharacters}.`,
        metadata.data,
      );
    } else if (metadata.type === 'body') {
      this.recursiveCheck(
        value,
        ACBS.ALLOWED_CHARACTERS_REGEX,
        (key, invalidCharacters) => `Field ${key} has invalid characters ${invalidCharacters}.`,
        metadata.data,
      );
    } else {
      throw new InternalServerErrorException(`Unknown input type '${metadata.type}'.`);
    }

    return value;
  }

  private recursiveCheck(
    value: any,
    findCharactersRegex: RegExp,
    errorMessageGenerator: (key: string, invalidCharacters: string) => string | HttpExceptionOptions,
    key: string = null,
  ) {
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([k, v]) => {
        this.recursiveCheck(v, findCharactersRegex, errorMessageGenerator, k);
      });
    } else if (Array.isArray(value)) {
      value.forEach((value) => this.recursiveCheck(value, findCharactersRegex, errorMessageGenerator));
    } else if (typeof value === 'string' && value.replace(findCharactersRegex, '') !== '') {
      const invalidCharacters = value.replace(findCharactersRegex, '');
      throw new BadRequestException('Bad request', errorMessageGenerator(key, invalidCharacters));
    }
  }
}
