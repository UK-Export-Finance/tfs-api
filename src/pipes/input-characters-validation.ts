import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ACBS } from '@ukef/constants';

@Injectable()
export class InputCharacterValidationPipe implements PipeTransform {
  transform(value: any) {
    this.checkNodes(value);

    return value;
  }

  checkNodes(value, key = null) {
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach((key) => {
        this.checkNodes(value[`${key}`], key);
      });
    } else if (Array.isArray(value)) {
      value.forEach((value) => this.checkNodes(value));
    } else if (ACBS.ALLOWED_CHARACTERS_REGEX.test(value) === false) {
      throw new BadRequestException('Bad request. Field ' + key + ' has not allowed characters. Value ' + value);
    }
  }
}
