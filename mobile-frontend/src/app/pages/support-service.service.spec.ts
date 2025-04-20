import { TestBed } from '@angular/core/testing';

import { SupportServiceService } from './support-service.service';

describe('SupportServiceService', () => {
  let service: SupportServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupportServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
