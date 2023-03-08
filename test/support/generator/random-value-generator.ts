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

  stringOfNumericCharacters(): string {
    return this.chance.string({ pool: '0123456789' });
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
