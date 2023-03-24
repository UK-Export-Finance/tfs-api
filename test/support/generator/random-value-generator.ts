import { UKEFID } from '@ukef/constants';
import { DateString, DateStringTransformations, UkefId } from '@ukef/helpers';
import { Chance } from 'chance';

export class RandomValueGenerator {
  private static readonly seed = 0;
  private readonly chance: Chance.Chance;
  private readonly dateStringTransformations: DateStringTransformations;

  constructor() {
    this.chance = new Chance(RandomValueGenerator.seed);
    this.dateStringTransformations = new DateStringTransformations();
  }

  boolean(): boolean {
    return this.chance.bool();
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

  nonnegativeFloat(options?: { max?: number; fixed: number }): number {
    const min = 0;
    // Fixed is for number of decimal places.
    const fixed = options && options.fixed ? options.fixed : 2;
    return options && options.max ? this.chance.floating({ min, fixed: fixed, max: options.max }) : this.chance.floating({ min, fixed: fixed });
  }

  date(): Date {
    return this.chance.date();
  }

  // UKEF id example 0030000321. It should be used for Deal and Facility IDs.
  ukefId(): UkefId {
    return (UKEFID.MAIN_ID_PREFIX.DEV + this.stringOfNumericCharacters({ length: 6 })) as UkefId;
  }

  dateTimeString(): DateString {
    return this.date().toISOString();
  }

  dateOnlyString(): DateString {
    return this.dateStringTransformations.removeTime(this.dateTimeString());
  }
}
