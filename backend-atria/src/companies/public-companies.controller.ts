import { Controller, Get } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('public/company')
export class PublicCompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findPrimary() {
    return this.companiesService.findPrimary();
  }
}
