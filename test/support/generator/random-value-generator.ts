import { DateString } from '@ukef/helpers/date-string.type';
import { Chance } from 'chance';

export class RandomValueGenerator {
  private static readonly seed = 0;
  private readonly chance: Chance.Chance;

  constructor() {
    this.chance = new Chance(RandomValueGenerator.seed);
  }

  string(): string {
    return this.chance.string();
  }

  word(options?: { length?: number }): string {
    return this.chance.word({ length: options?.length });
  }

  httpsUrl(): string {
    return this.chance.url({ protocol: 'https' });
  }

  stringOfNumericCharacters(options?: { length?: number; minLength?: number; maxLength?: number }): string {
    const minLength = options && options.minLength ? options.minLength : 0;
    const maxLength = options && options.maxLength ? options.maxLength : Math.max(20, minLength * 2);
    const length = options && options.length ? options.length : this.chance.integer({ min: minLength, max: maxLength });

    return this.chance.string({ length, pool: '0123456789' });
  }

  probabilityFloat(): number {
    return this.chance.floating({ min: 0, max: 1 });
  }

  nonnegativeFloat(options?: { max?: number }): number {
    const min = 0;
    return options && options.max ? this.chance.floating({ min, max: options.max }) : this.chance.floating({ min });
  }

  date(): Date {
    return this.chance.date();
  }

  dateTimeString(): DateString {
    return this.date().toISOString();
  }

  dateOnlyString(): DateString {
    return this.dateTimeString().split('T')[0];
  }
}
