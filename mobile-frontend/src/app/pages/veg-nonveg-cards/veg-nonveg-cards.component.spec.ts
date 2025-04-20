import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VegNonvegCardsComponent } from './veg-nonveg-cards.component';

describe('VegNonvegCardsComponent', () => {
  let component: VegNonvegCardsComponent;
  let fixture: ComponentFixture<VegNonvegCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VegNonvegCardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VegNonvegCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
