export interface AcbsUpdateDealBorrowingRestrictionRequest {
  SequenceNumber: number;
  RestrictGroupCategory: {
    RestrictGroupCategoryCode: string;
  };
  IncludingIndicator: boolean;
  IncludeExcludeAllItemsIndicator: boolean;
}
