import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { AcbsBundleId } from '@ukef/helpers';

export class CreateLoanAmountAmendmentResponse {
  @ApiProperty({
    description: 'The ID of the created loan amendment bundle.',
    example: EXAMPLES.ACBS_BUNDLE_ID,
  })
  readonly bundleIdentifier: AcbsBundleId;
  readonly warningErrors: string;
}
