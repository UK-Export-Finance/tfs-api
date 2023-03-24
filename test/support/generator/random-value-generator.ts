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

  word(): string {
    return this.chance.word();
  }

  httpsUrl(): string {
    return this.chance.url({ protocol: 'https' });
  }

  stringOfNumericCharacters(minLength?: number): string {
    const stringOptions: Partial<Chance.StringOptions> = { pool: '0123456789' };
    if (minLength) {
      const length = this.chance.integer({ min: minLength, max: Math.max(20, minLength * 2) });
      stringOptions.length = length;
    }
    return this.chance.string(stringOptions);
  }

  probabilityFloat(): number {
    return this.chance.floating({ min: 0, max: 1 });
  }

  nonnegativeFloat(fixed = 2): number {
    return this.chance.floating({ min: 0, fixed });
  }

  date(): Date {
    return this.chance.date();
  }

  // UKEF id example 0030000321. It should be used for Deal and Facility IDs.
  // TODO: stringOfNumericCharacters should generate 6 digits, but doesn't support Max value at the moment.
  ukefId(): UkefId {
    return (UKEFID.MAIN_ID_PREFIX.DEV + this.stringOfNumericCharacters(6)) as UkefId;
  }

  // Date string example 2023-03-16
  dateString(): DateString {
    return this.dateStringTransformations.removeTime(this.date().toISOString());
  }
}
