import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonVegListComponent } from './non-veg-list.component';

describe('NonVegListComponent', () => {
  let component: NonVegListComponent;
  let fixture: ComponentFixture<NonVegListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonVegListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonVegListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
