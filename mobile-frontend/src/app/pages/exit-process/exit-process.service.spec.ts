import { TestBed } from '@angular/core/testing';

import { ExitProcessService } from './exit-process.service';

describe('ExitProcessService', () => {
  let service: ExitProcessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExitProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
