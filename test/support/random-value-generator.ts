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
}
