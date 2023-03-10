import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrentDateProvider {
  getLatestDateFromTodayAnd(otherDate: Date): Date {
    const now = new Date();

    if (otherDate > now) {
      return otherDate;
    }

    return now;
  }

  getEarliestDateFromTodayAnd(otherDate: Date): Date {
    const now = new Date();

    if (otherDate < now) {
      return otherDate;
    }

    return now; // TODO APIM-74: Do we use the "date" in UTC or in British local time?
  }
}
