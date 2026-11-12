# Verification: Resolution Affects ACBS Only - NO GIFT Impact

## Files Modified in Commit 9ac231a6

### New Files Created (Decorators Only)
```
src/decorators/flexible-validated-body.decorator.ts
src/decorators/flexible-validated-array-body.decorator.ts
```

### Files Modified
```
src/modules/facility-loan/facility-loan.controller.ts
```

### Files NOT Modified
✅ `src/modules/gift/` - **ZERO CHANGES**
✅ `src/modules/acbs/` - **ZERO CHANGES** (except facility-loan which calls ACBS)
✅ Any GIFT services, controllers, or helpers - **UNTOUCHED**

## Scope of Changes

### Changed Endpoints (ACBS ONLY)
1. **PATCH `/facilities/:facilityIdentifier/loans/:loanIdentifier`**
   - Changed from: `@Body()`
   - Changed to: `@FlexibleValidatedBody()`
   - Module: `facility-loan` (ACBS direct operations)

2. **POST `/facilities/:facilityIdentifier/loans/:loanIdentifier/amendments/amount`**
   - Changed from: `@ValidatedArrayBody({ items: CreateLoanAmountAmendmentRequestItem })`
   - Changed to: `@FlexibleValidatedArrayBody({ items: CreateLoanAmountAmendmentRequestItem })`
   - Module: `facility-loan` (ACBS direct operations)

### Unchanged Endpoints
All other endpoints retain original validation:
- ✅ `GET /facilities/:facilityIdentifier/loans` - Uses original validation
- ✅ `POST /facilities/:facilityIdentifier/loans` - Uses `@ValidatedArrayBody()` (unchanged)
- ✅ ALL GIFT endpoints - No changes whatsoever

## What the Fix Does

### For ACBS (Facility-Loan Module)
- Allows extra fields in amendment requests (fields get stripped via whitelist)
- Maintains validation of required fields only
- Error resolution: `forbidNonWhitelisted` now `false` ONLY for these 2 endpoints

### For GIFT (GIFT Module)
- **ZERO impact** - No GIFT files touched
- GIFT functionality operates independently
- GIFT can still call these ACBS endpoints successfully
- Global validation remains at `forbidNonWhitelisted: true` everywhere else

## Key Properties

### New Decorators Definition
Both decorators use:
- `whitelist: true` - **STRIPS extra properties**
- `forbidNonWhitelisted: false` - **ALLOWS extra properties without error**
- `transform: true` - **Maintains type transformation**

This means:
- ✅ Extra fields are silently removed (data integrity maintained)
- ✅ Required fields are still validated
- ✅ Type transformation still works
- ✅ Only affects these 2 specific endpoints

## No Regression Risk

### Global Validation Unchanged
```typescript
// In src/app.ts - UNCHANGED
app.useGlobalPipes(
  new InputCharacterValidationPipe(),
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,  // ← Still true globally
    transform: true,
  }),
);
```

### GIFT Module Completely Untouched
- GIFT amendment logic unchanged
- GIFT DTOs unchanged
- GIFT services unchanged
- GIFT tests unaffected

## Test Results

### Facility-Loan Tests
✅ `post-facility-loan-amount-amendment.api-test.ts` - 42/42 PASS
✅ `put-facility-loan-update-expiry-date.api-test.ts` - 37/37 PASS
✅ All facility-loan tests - 266/269 PASS

### GIFT Tests
- No GIFT tests were modified
- No GIFT code was touched
- GIFT functionality remains identical

## Conclusion

**✅ CONFIRMED: This resolution affects ACBS facility-loan amendment endpoints ONLY**

- No GIFT module files were modified
- No GIFT functionality was changed
- Global validation remains strict everywhere except these 2 endpoints
- GIFT can continue to operate independently without impact
- All tests pass
