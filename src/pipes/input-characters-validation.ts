import { BadRequestException, Injectable, InternalServerErrorException, PipeTransform } from '@nestjs/common';
import { ACBS } from '@ukef/constants';

@Injectable()
export class InputCharacterValidationPipe implements PipeTransform {
  transform(value: any, metadata) {
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

  recursiveCheck(value, findCharactersRegex, errorMessageGenerator, key = null) {
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach((key) => {
        this.recursiveCheck(value[`${key}`], findCharactersRegex, errorMessageGenerator, key);
      });
    } else if (Array.isArray(value)) {
      value.forEach((value) => this.recursiveCheck(value, findCharactersRegex, errorMessageGenerator));
    } else if (typeof value === 'string' && value.replace(findCharactersRegex, '') !== '') {
      const invalidCharacters = value.replace(findCharactersRegex, '');
      throw new BadRequestException('Bad request', errorMessageGenerator(key, invalidCharacters));
    }
  }
}
