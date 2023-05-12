export interface AccrualSchedule {
  AccrualCategory: {
    AccrualCategoryCode: string;
  };
  SpreadRate: number;
  YearBasis: {
    YearBasisCode: string;
  };
  IndexRateChangeFrequency: {
    IndexRateChangeFrequencyCode: string;
  };
}
