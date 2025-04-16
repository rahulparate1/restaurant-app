import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VegCardComponent } from './veg-card.component';

describe('VegCardComponent', () => {
  let component: VegCardComponent;
  let fixture: ComponentFixture<VegCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VegCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VegCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
