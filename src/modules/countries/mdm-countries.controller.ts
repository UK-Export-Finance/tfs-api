import { Controller, Get, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { MdmCountryEntity } from './entities/mdm-country.entity';
import { MdmCountriesService } from './mdm-countries.service';

@ApiBearerAuth()
@ApiTags('countries')
@Controller('countries')
export class MdmCountriesController {
  constructor(private readonly countryService: MdmCountriesService) {}

  @Get()
  @Version('1')
  @ApiResponse({
    status: 200,
    description: 'Get all active countries',
    type: MdmCountryEntity,
  })
  findAll(): Promise<MdmCountryEntity[]> {
    return this.countryService.findAll();
  }
}
