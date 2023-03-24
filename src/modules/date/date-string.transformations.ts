import { Injectable } from '@nestjs/common';
import { DATE_FORMATS } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';
import { DateString } from '@ukef/helpers/date-string.type';
import { matches } from 'class-validator';

@Injectable()
export class DateStringTransformations {
  /**
   * Remove time part from DateTime string.
   */
  removeTime(dateTime: string): DateString {
    if (!dateTime) {
      throw new TypeError(`Cannot remove the time from ${dateTime}.`);
    }
    return dateTime.split('T')[0] as DateString;
  }

  /**
   * Check if dateTime input is not null or empty before removing time.
   */
  removeTimeIfExists(dateTime: string): DateString {
    return (dateTime ? this.removeTime(dateTime) : dateTime) as DateString;
  }

  dateOnlyStringToDateString(dateOnlyString: DateOnlyString): DateString {
    if (!matches(dateOnlyString, DATE_FORMATS.DATE_ONLY_STRING.regex)) {
      throw new TypeError(`${dateOnlyString} is not a valid DateOnlyString as it is not in ${DATE_FORMATS.DATE_ONLY_STRING.description} format.`);
    }
    return dateOnlyString + 'T00:00:00Z';
  }
}
