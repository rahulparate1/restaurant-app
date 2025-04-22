import { TestBed } from '@angular/core/testing';

import { VegMasterService } from './veg-master.service';

describe('VegMasterService', () => {
  let service: VegMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VegMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
