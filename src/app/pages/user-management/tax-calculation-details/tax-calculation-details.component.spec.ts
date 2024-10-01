import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxCalculationDetailsComponent } from './tax-calculation-details.component';

describe('TaxCalculationDetailsComponent', () => {
  let component: TaxCalculationDetailsComponent;
  let fixture: ComponentFixture<TaxCalculationDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaxCalculationDetailsComponent]
    });
    fixture = TestBed.createComponent(TaxCalculationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
