# npm Audit Vulnerabilities: Accepted Risk

**Decision**: Accept the 6 npm audit vulnerabilities as a known, non-exploitable issue.

**Date**: 2026-11-25

## Vulnerabilities

| Package | Severity | CVE | Issue |
|---------|----------|-----|-------|
| brace-expansion | HIGH | GHSA-q2hr-2g5m-vwhr | DoS via quadratic-time expansion |
| brace-expansion | HIGH | GHSA-qhr7-859c-m2p7 | DoS via uncontrolled recursion on nested brace groups |
| brace-expansion | HIGH | GHSA-6j4f-fj2g-mc7p | DoS via uncontrolled recursion in parseCommaParts |
| extract-zip | HIGH | GHSA-jmr9-qjv8-65gv | Symlink traversal |
| extract-zip | HIGH | GHSA-7pqw-9j4j-h8q3 | Arbitrary file writes through symlink entries |
| glob | MODERATE | GHSA-3g3m-2fjr-6pw4 | AbortSignal cancellation bypass |
| minimatch | MODERATE | GHSA-g3hv-75wg-m249 | DoS via globparts amplification |

**Root Cause**: All vulnerabilities are in transitive dependencies of `azure-functions-core-tools@4.17.0` (a devDependency).

## Production Risk Assessment

### ✅ NOT EXPLOITABLE IN PRODUCTION

**Proof**:
1. `azure-functions-core-tools` is a **devDependency only** - not included in production builds
2. Production dependencies: only `@azure/functions@4.17.1` and `axios@1.21.1`
3. Neither production dependency includes the vulnerable packages
4. Docker production image (Stage 2) only copies compiled code and production dependencies
5. Vulnerable packages never reach production runtime

**Location of vulnerabilities**: `tfs-functions/node_modules/azure-functions-core-tools/node_modules/`

### Low Risk in Development/CI

| Scenario | Risk | Mitigation |
|----------|------|-----------|
| Local development | Low | Only exploitable if processing untrusted artifacts locally |
| CI/CD builds | Low-Medium | Depends on CI environment; isolated/sandboxed environments are safe |
| Running `func start` | Low | Only affects local testing, not production |

## Why Not Fixed

### Option A: `npm audit fix --force`
- Downgrades `azure-functions-core-tools` from 4.17.0 → 3.0.5682 (2+ years old)
- **Breaking change** - Risk of functionality loss
- Not recommended

### Option B: npm Overrides/DevDependencies
- Installing patched versions as devDependencies doesn't fix audit report
- `npm audit` still flags nested copies in `azure-functions-core-tools/node_modules/`
- Adds maintenance burden without solving the problem
- Rejected

### Option C: Accept Risk (CHOSEN)
- Vulnerabilities are dev-only, non-exploitable in production
- Minimal risk in development with standard security practices
- Monitor for azure-functions-core-tools updates that patch natively
- Cleanest approach

## Recommendations

1. **Monitor** for azure-functions-core-tools 4.x updates that include patched dependencies
2. **Document** this decision in security reviews/audits
3. **Don't add** workarounds that don't actually fix the issue
4. **Educate team** that npm audit warnings don't always indicate production risk
5. **Review again** if development practices change to process untrusted inputs

## References

- [azure-functions-core-tools releases](https://github.com/Azure/azure-functions-core-tools/releases)
- Security advisories: See CVE links above
- Related discussion: Transitive dependency vulnerabilities in dev tools are common and often acceptable when not shipped to production
