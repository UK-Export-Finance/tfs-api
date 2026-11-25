export type AcbsUpdateDealBorrowingRestrictionRequest = {
  SequenceNumber: number;
  RestrictGroupCategory: {
    RestrictGroupCategoryCode: string;
  };
  IncludingIndicator: boolean;
  IncludeExcludeAllItemsIndicator: boolean;
};
