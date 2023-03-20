import { Injectable } from '@nestjs/common';
import { DateString } from '@ukef/helpers/date-string.type';

@Injectable()
export class DateStringTransformations {
  /**
   * Remove time part from DateTime string.
   */
  removeTime(dateTime: string): DateString {
    return dateTime.split('T')[0] as DateString;
  }

  /**
   * Check if dateTime input is not null or empty before removing time.
   */
  removeTimeIfExists(dateTime: string): DateString {
    return (dateTime ? this.removeTime(dateTime) : dateTime) as DateString;
  }
}
