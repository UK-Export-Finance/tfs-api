import { BadRequestException, PipeTransform } from '@nestjs/common';

export class NonEmptyObjectRequestBodyValidationPipe implements PipeTransform {
  transform(requestBody: any): any {
    if (Array.isArray(requestBody)) {
      throw new BadRequestException('The request body cannot be an array.');
    }

    if (Object.values(requestBody).every((field) => field === undefined)) {
      throw new BadRequestException('The request body cannot be the empty object.');
    }

    return requestBody;
  }
}
