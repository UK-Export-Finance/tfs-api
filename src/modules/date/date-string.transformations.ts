import { Injectable } from '@nestjs/common';
import { DATE_FORMATS } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers';
import { DateString } from '@ukef/helpers/date-string.type';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { matches } from 'class-validator';
import { DateTime } from 'luxon';

@Injectable()
export class DateStringTransformations {
  /**
   * Remove time part from DateTime string.
   */
  removeTime(dateTime: DateString): DateOnlyString {
    if (!dateTime) {
      throw new TypeError(`Cannot remove the time from ${dateTime}.`);
    }
    return dateTime.split('T')[0];
  }

  /**
   * Check if dateTime input is not null or empty before removing time.
   */
  removeTimeIfExists(dateTime: DateString): DateOnlyString {
    return dateTime ? this.removeTime(dateTime) : dateTime;
  }

  addTimeToDateOnlyString(dateOnlyString: DateOnlyString): DateString {
    if (!matches(dateOnlyString, DATE_FORMATS.DATE_ONLY_STRING.regex)) {
      throw new TypeError(`${dateOnlyString} is not a valid DateOnlyString as it is not in ${DATE_FORMATS.DATE_ONLY_STRING.description} format.`);
    }
    return dateOnlyString + 'T00:00:00Z';
  }

  getDateStringFromDate(date: Date): DateString {
    const dateOnlyString = this.getDateOnlyStringFromDate(date);
    return this.addTimeToDateOnlyString(dateOnlyString);
  }

  getDateOnlyStringFromDate(date: Date): DateOnlyString {
    const dateAsIsoString = date.toISOString();
    return this.removeTime(dateAsIsoString);
  }

  getDisplayDateFromDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB').format(date);
  }

  getDayFromDateOnlyString(dateOnlyString: DateOnlyString): number {
    const date = new Date(dateOnlyString);
    return date.getDate();
  }

  getEarliestDateFromTodayAndDateAsString(dateAsString: string, currentDateProvider: CurrentDateProvider): DateString {
    const dateTime = currentDateProvider.getEarliestDateFromTodayAnd(new Date(this.addTimeToDateOnlyString(dateAsString)));
    return this.getDateStringFromDate(dateTime);
  }

  getDatePlusThreeMonths(dateAsString: string): DateString {
    const date = DateTime.fromISO(this.addTimeToDateOnlyString(dateAsString)).setZone('utc');
    const datePlusThreeMonths = date.plus({ months: 3 });
    return this.getDateOnlyStringFromDate(new Date(datePlusThreeMonths.toString()));
  }
}
