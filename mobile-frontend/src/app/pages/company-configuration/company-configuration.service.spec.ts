import { TestBed } from '@angular/core/testing';

import { CompanyConfigurationService } from './company-configuration.service';

describe('CompanyConfigurationService', () => {
  let service: CompanyConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
