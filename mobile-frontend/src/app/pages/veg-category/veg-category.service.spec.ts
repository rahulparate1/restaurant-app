import { TestBed } from '@angular/core/testing';

import { VegCategoryService } from './veg-category.service';

describe('VegCategoryService', () => {
  let service: VegCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VegCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
