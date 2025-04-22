import { TestBed } from '@angular/core/testing';

import { NonVegMasterService } from './non-veg-master.service';

describe('NonVegMasterService', () => {
  let service: NonVegMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NonVegMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
