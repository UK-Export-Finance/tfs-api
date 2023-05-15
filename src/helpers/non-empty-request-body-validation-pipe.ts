import { BadRequestException, PipeTransform } from '@nestjs/common';

export class NonEmptyRequestBodyValidationPipe implements PipeTransform {
  transform(requestBody: any): any {
    if (Object.values(requestBody).every((field) => field === undefined)) {
      throw new BadRequestException('The request body cannot be the empty object.');
    }

    return requestBody;
  }
}
