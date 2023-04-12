import { UKEFID } from '@ukef/constants';
import { AcbsPartyId, DateOnlyString, DateString, UkefId } from '@ukef/helpers';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
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

  string(options?: { length?: number; minLength?: number; maxLength?: number }): string {
    const length = this.getStringLengthFromOptions(options);
    return this.chance.string({ length });
  }

  stringOfNumericCharacters(options?: { length?: number; minLength?: number; maxLength?: number }): string {
    const length = this.getStringLengthFromOptions(options);
    return this.chance.string({ length, pool: '0123456789' });
  }

  private getStringLengthFromOptions(options?: { length?: number; minLength?: number; maxLength?: number }): number {
    const minLength = options && (options.minLength || options.minLength === 0) ? options.minLength : 0;
    const maxLength = options && (options.maxLength || options.maxLength === 0) ? options.maxLength : Math.max(20, minLength * 2);
    const length = options && (options.length || options.length === 0) ? options.length : this.chance.integer({ min: minLength, max: maxLength });
    return length;
  }

  word(options?: { length?: number }): string {
    return this.chance.word({ length: options?.length });
  }

  httpsUrl(): string {
    return this.chance.url({ protocol: 'https' });
  }

  character(): string {
    return this.chance.character();
  }

  probabilityFloat(): number {
    return this.chance.floating({ min: 0, max: 1 });
  }

  nonnegativeFloat(options?: { max?: number; fixed?: number }): number {
    const min = 0;
    // Fixed is for number of decimal places.
    const fixed = options && options.fixed ? options.fixed : 2;
    return options && options.max ? this.chance.floating({ min, fixed: fixed, max: options.max }) : this.chance.floating({ min, fixed: fixed });
  }

  date(): Date {
    return this.chance.date();
  }

  integer({ min, max }: { min?: number; max?: number } = {}): number {
    return this.chance.integer({ min, max });
  }

  nonnegativeInteger({ max }: { max?: number } = {}): number {
    return this.integer({ min: 0, max });
  }

  // UKEF id example 0030000321. It should be used for Deal and Facility IDs.
  ukefId(lengthExcludingPrefix?: number): UkefId {
    return (UKEFID.MAIN_ID_PREFIX.DEV + this.stringOfNumericCharacters({ length: lengthExcludingPrefix ?? 6 })) as UkefId;
  }

  // ACBS internal id format example 00000321.
  acbsPartyId(): AcbsPartyId {
    return this.stringOfNumericCharacters({ length: 8 }) as AcbsPartyId;
  }

  dateTimeString(): DateString {
    return this.date().toISOString();
  }

  dateOnlyString(): DateOnlyString {
    return this.dateStringTransformations.removeTime(this.dateTimeString());
  }
}
