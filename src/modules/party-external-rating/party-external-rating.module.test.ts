import { Module } from '@nestjs/common';

import { PartyExternalRatingController } from './party-external-rating.controller';
import { PartyExternalRatingModule } from './party-external-rating.module';
import { PARTY_EXTERNAL_RATINGS_PROVIDER_SYMBOL } from './party-external-rating.module-definition';
import { PartyExternalRatingsProvider } from './party-external-ratings.provider';

describe('PartyExternalRatingModule', () => {
  describe('register', () => {
    it('returns a module with the given class as the PartyExternalRatingsProvider', () => {
      @Module({})
      class TestModule {}

      class TestProvider implements PartyExternalRatingsProvider {
        getExternalRatingsForParty = jest.fn();
      }

      const module = PartyExternalRatingModule.register({
        imports: [TestModule],
        partyExternalRatingsProviderClass: TestProvider,
      });

      expect(module).toStrictEqual({
        module: PartyExternalRatingModule,
        imports: [TestModule],
        controllers: [PartyExternalRatingController],
        providers: [{ provide: PARTY_EXTERNAL_RATINGS_PROVIDER_SYMBOL, useClass: TestProvider }],
      });
    });
  });
});
