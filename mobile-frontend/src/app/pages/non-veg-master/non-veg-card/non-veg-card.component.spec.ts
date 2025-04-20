import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonVegCardComponent } from './non-veg-card.component';

describe('NonVegCardComponent', () => {
  let component: NonVegCardComponent;
  let fixture: ComponentFixture<NonVegCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonVegCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonVegCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
