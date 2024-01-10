import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentsDeductionsComponent } from './investments-deductions.component';

describe('InvestmentsDeductionsComponent', () => {
  let component: InvestmentsDeductionsComponent;
  let fixture: ComponentFixture<InvestmentsDeductionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvestmentsDeductionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentsDeductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
