import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrentDateProvider {
  getLatestDateFromTodayAnd(otherDate: Date): Date {
    const now = new Date();

    if (now > otherDate) {
      return now;
    }

    return otherDate;
  }
}
