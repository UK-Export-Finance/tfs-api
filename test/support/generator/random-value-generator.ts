import { ACBSID, UKEFID } from '@ukef/constants';
import { AcbsBundleId, AcbsPartyId, DateOnlyString, DateString, UkefCovenantId, UkefId } from '@ukef/helpers';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { Chance } from 'chance';

interface Enum {
  [key: number | string]: string | number;
}
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
    return this.float({ min: 0, max: 1 });
  }

  nonnegativeFloat(options?: { max?: number; fixed?: number }): number {
    const min = 0;
    const max = options?.max;
    const fixed = options?.fixed ?? 2;
    return this.float({ min, max, fixed });
  }

  float({ min, max, fixed }: { min?: number; max?: number; fixed?: number }): number {
    // Fixed is for number of decimal places.
    return this.chance.floating({ min, max, fixed });
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

  dealId(): UkefId {
    return this.ukefId();
  }

  /**
   * Usually prefix length is 4.
   */
  facilityId(lengthExcludingPrefix?: number): UkefId {
    return this.ukefId(lengthExcludingPrefix ?? 6);
  }

  // UKEF id example 0030000321. It should be used for Deal and Facility IDs.
  ukefId(lengthExcludingPrefix?: number): UkefId {
    return UKEFID.MAIN_ID.PREFIX.DEV.concat(this.stringOfNumericCharacters({ length: lengthExcludingPrefix ?? 6 })) as UkefId;
  }

  // UKEF Covenant id example 0000123456.
  ukefCovenantId(lengthExcludingPrefix?: number): UkefCovenantId {
    return UKEFID.COVENANT_ID.PREFIX.concat(this.stringOfNumericCharacters({ length: lengthExcludingPrefix ?? 6 })) as UkefCovenantId;
  }

  acbsPartyId(lengthExcludingPrefix?: number): AcbsPartyId {
    return ACBSID.PARTY_ID.PREFIX.concat(this.stringOfNumericCharacters({ length: lengthExcludingPrefix ?? 6 })) as AcbsPartyId;
  }

  acbsBundleId(lengthExcludingPrefix?: number): AcbsBundleId {
    return ACBSID.BUNDLE_ID.PREFIX.concat(this.stringOfNumericCharacters({ length: lengthExcludingPrefix ?? 6 })) as AcbsBundleId;
  }

  portfolioId(): string {
    return this.string({ length: 2 });
  }

  loanId(): string {
    return this.stringOfNumericCharacters({ length: 10 });
  }

  dateTimeString(): DateString {
    return this.date().toISOString();
  }

  dateOnlyString(): DateOnlyString {
    return this.dateStringTransformations.removeTime(this.dateTimeString());
  }

  enumValue<T = string>(theEnum: Enum): T {
    const possibleValues = Object.values(theEnum);
    return possibleValues[this.integer({ min: 0, max: possibleValues.length - 1 })] as T;
  }
}
