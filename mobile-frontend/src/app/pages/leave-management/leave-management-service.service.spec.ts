import { TestBed } from '@angular/core/testing';

import { LeaveManagementServiceService } from './leave-management-service.service';

describe('LeaveManagementServiceService', () => {
  let service: LeaveManagementServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaveManagementServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
