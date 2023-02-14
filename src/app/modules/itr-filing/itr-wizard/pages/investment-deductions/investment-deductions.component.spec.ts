import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentDeductionsComponent } from './investment-deductions.component';

describe('InvestmentDeductionsComponent', () => {
  let component: InvestmentDeductionsComponent;
  let fixture: ComponentFixture<InvestmentDeductionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestmentDeductionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentDeductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
