import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsString, Length } from 'class-validator';

import { GiftRepaymentProfileAllocationDto } from './repayment-profile-allocation';

// import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// export function testCustomDecorator(property: string, validationOptions?: ValidationOptions) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       name: 'testCustomDecorator',
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [property],
//       options: validationOptions,
//       validator: {
//         validate(value: any, args: ValidationArguments) {
//           // console.log('>>>>> args ', args);
//           console.log('>>>>> value ', value);

//           console.log('>>>>> value[0] ', value[0]);

//           const uniqueDueDates = new Set(value.map((obj: any) => obj.dueDate)) as Array<string>;

//           if (uniqueDueDates.length !== value.length) {

//           }

//           const [relatedPropertyName] = args.constraints;

//           const relatedValue = (args.object as any)[relatedPropertyName];

//           return typeof value === 'string' && typeof relatedValue === 'string' && value.length > relatedValue.length;
//         },
//       },
//     });
//   };
// }

const {
  GIFT: { REPAYMENT_PROFILE, REPAYMENT_PROFILE_ALLOCATION },
} = EXAMPLES;

const {
  VALIDATION: { REPAYMENT_PROFILE: VALIDATION },
} = GIFT;

/**
 * GIFT repayment profile DTO.
 * These fields are required for APIM to create a repayment profile in GIFT.
 */
export class GiftRepaymentProfileDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.NAME.MIN_LENGTH, VALIDATION.NAME.MAX_LENGTH)
  @ApiProperty({
    required: true,
    example: REPAYMENT_PROFILE.name,
  })
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  // @testCustomDecorator('dueDate')
  @Type(() => GiftRepaymentProfileAllocationDto)
  @ApiProperty({
    isArray: true,
    example: [REPAYMENT_PROFILE_ALLOCATION, REPAYMENT_PROFILE_ALLOCATION],
    required: true,
    type: GiftRepaymentProfileAllocationDto,
  })
  allocations: GiftRepaymentProfileAllocationDto[];
}
