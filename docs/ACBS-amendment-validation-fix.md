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

Created two route-specific validation pipes that allow extra properties while
still stripping them via whitelist. This follows NestJS best practices and
Codacy's recommendation for cleaner architectural separation.

### 1. FlexibleValidationPipe

`src/pipes/flexible-validation.pipe.ts`

- Extends NestJS `ValidationPipe`
- For single-object request bodies (e.g., PATCH requests)
- Sets `forbidNonWhitelisted: false` to allow extra properties
- Still uses `whitelist: true` to strip them
- Applied to route with `@UsePipes(new FlexibleValidationPipe())`

### 2. FlexibleArrayValidationPipe

`src/pipes/flexible-array-validation.pipe.ts`

- Extends NestJS `ValidationPipe`
- For array request bodies (e.g., POST amendment requests)
- Validates each array item individually
- Sets `forbidNonWhitelisted: false` to allow extra properties in array items
- Still uses `whitelist: true` to strip them
- Applied to route with `@UsePipes(new FlexibleArrayValidationPipe({ items: DTO }))`

### 3. Updated Controllers

`src/modules/facility-loan/facility-loan.controller.ts`

Applied flexible validation pipes to amendment endpoints:

- `PATCH /facilities/:facilityIdentifier/loans/:loanIdentifier`
  - Uses `@UsePipes(new FlexibleValidationPipe())`
  - Method parameter: standard `@Body()`
  
- `POST /facilities/:facilityIdentifier/loans/:loanIdentifier/amendments/amount`
  - Uses `@UsePipes(new FlexibleArrayValidationPipe({ items: CreateLoanAmountAmendmentRequestItem }))`
  - Method parameter: standard `@Body()`

## Architectural Benefits

- ✅ **Clearer separation of concerns** - Global validation applies to all routes, 
  route-specific pipes handle exceptions
- ✅ **Better code organization** - Validation logic in pipe layer, not parameter 
  decorators
- ✅ **Improved testability** - Pipes can be unit tested independently
- ✅ **Follows NestJS best practices** - Recommended pattern for custom validation
- ✅ **Codacy compliant** - Implements Codacy's recommendation for route-specific 
  validation

## Validation Behavior

### What's Allowed Flexibly
- Extra fields in request body
- Requests from multiple sources (GIFT, direct API)
- Varying field sets based on amendment type

### What's Still Validated Strictly
- Required fields must be present
- Field types must match DTO specifications
- Field constraints (forbidZero, min/max, patterns) enforced
- Date formats must be valid ISO 8601
- All global validation rules still apply to other endpoints

### How It Works

1. Request arrives at amendment endpoint
2. Route-specific pipe runs: `forbidNonWhitelisted: false, whitelist: true`
3. Extra fields don't cause validation failures
4. Extra fields are stripped from DTO instance
5. Controller receives cleaned, validated data
6. Global validation rules remain unchanged for all other endpoints

## Testing

All amendment endpoint tests pass:

- `post-facility-loan-amount-amendment.api-test.ts`: 47 tests ✅
- `put-facility-loan-update-expiry-date.api-test.ts`: 37 tests ✅
- `flexible-validation.api-test.ts`: 8 tests ✅
- Full facility-loan amendment suite: 92/92 tests ✅

## Related Issues

- Validation errors no longer occur when receiving requests with extra fields
- Cleaner architectural separation: global strict validation + route-specific 
  flexible validation
- Better maintainability through explicit pipe usage

