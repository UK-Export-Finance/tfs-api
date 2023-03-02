import { Chance } from 'chance';

export class RandomValueGenerator {
  private static readonly seed = 0;
  private readonly chance: Chance.Chance;

  constructor() {
    this.chance = new Chance(RandomValueGenerator.seed);
  }

  public string(): string {
    return this.chance.string();
  }

  public stringOfNumericCharacters(): string {
    return this.chance.string({ pool: '0123456789' });
  }

  public probabilityFloat(): number {
    return this.chance.floating({ min: 0, max: 1 });
  }

  public nonnegativeFloat(): number {
    return this.chance.floating({ min: 0 });
  }

  public date(): Date {
    return this.chance.date();
  }
}
