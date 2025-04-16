import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VegListComponent } from './veg-list.component';

describe('VegListComponent', () => {
  let component: VegListComponent;
  let fixture: ComponentFixture<VegListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VegListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VegListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
