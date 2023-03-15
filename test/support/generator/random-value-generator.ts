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

  nonnegativeFloat(): number {
    return this.chance.floating({ min: 0 });
  }

  date(): Date {
    return this.chance.date();
  }
}
