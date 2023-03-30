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

    return now;
  }
}
