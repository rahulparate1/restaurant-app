import { TestBed } from '@angular/core/testing';

import { NonVegCategoryService } from './non-veg-category.service';

describe('NonVegCategoryService', () => {
  let service: NonVegCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NonVegCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
