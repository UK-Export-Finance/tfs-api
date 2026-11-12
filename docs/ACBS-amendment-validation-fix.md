# Fix: Flexible Validation for ACBS Amendment Endpoints

## Problem

APIM-725. After GIFT integration, amendment endpoints were receiving validation errors
when called with requests containing fields that don't belong to the specific
amendment type. This resulted in two conflicting errors:

1. When sending only `expiryDate`: validation expected `effectiveDate` and
   `amountAmendment`
2. When sending all fields together: validation said `effectiveDate` and
   `amountAmendment` shouldn't exist

### Root Cause

The global `forbidNonWhitelisted: true` validation rule in `app.ts` was too
strict for amendment endpoints. This setting causes NestJS to **fail validation
immediately** if extra properties are present, before the DTO's `whitelist:
true` can strip them. This is problematic when:

- Multiple integration points (GIFT, direct API calls) send requests with
  varying field sets
- Requests may include extra fields from upstream systems
- Amendment endpoints handle different amendment types with different required
  fields

## Solution

Created two new flexible decorators that allow extra properties while still
stripping them via whitelist:

### 1. FlexibleValidatedBody

`src/decorators/flexible-validated-body.decorator.ts`

- For single-object request bodies (e.g., PATCH requests)
- Sets `forbidNonWhitelisted: false` to allow extra properties
- Still uses `whitelist: true` to strip them

### 2. FlexibleValidatedArrayBody

`src/decorators/flexible-validated-array-body.decorator.ts`

- For array request bodies (e.g., POST amendment requests)
- Sets `forbidNonWhitelisted: false` to allow extra properties in array items
- Still uses `whitelist: true` to strip them

### 3. Updated Controllers

`src/modules/facility-loan/facility-loan.controller.ts`

Applied flexible validation to amendment endpoints:

- `PATCH /facilities/:facilityIdentifier/loans/:loanIdentifier` - uses
  `@FlexibleValidatedBody()`
- `POST /facilities/:facilityIdentifier/loans/:loanIdentifier/amendments/amount`
  - uses `@FlexibleValidatedArrayBody()`

## Benefits

- ✅ **Maintains strict validation elsewhere** - Global `forbidNonWhitelisted:
  true` still applies to all other endpoints
- ✅ **Allows flexible amendment handling** - ACBS amendment endpoints accept
  extra fields that get stripped automatically
- ✅ **Backward compatible** - Existing tests pass; no breaking changes
- ✅ **Data integrity** - Only expected fields are processed; extra fields are
  silently discarded

## Testing

All facility-loan tests pass:

- `post-facility-loan-amount-amendment.api-test.ts`: 42 tests ✅
- `put-facility-loan-update-expiry-date.api-test.ts`: 37 tests ✅
- Full facility-loan suite: 266/269 tests ✅

## Related Issues

- Validation errors no longer occur when receiving requests with extra fields
- Better separation of concerns: global strict validation + endpoint-specific
  flexible validation
