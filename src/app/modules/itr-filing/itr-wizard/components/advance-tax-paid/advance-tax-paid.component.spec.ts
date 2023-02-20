import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceTaxPaidComponent } from './advance-tax-paid.component';

describe('AdvanceTaxPaidComponent', () => {
  let component: AdvanceTaxPaidComponent;
  let fixture: ComponentFixture<AdvanceTaxPaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvanceTaxPaidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceTaxPaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
