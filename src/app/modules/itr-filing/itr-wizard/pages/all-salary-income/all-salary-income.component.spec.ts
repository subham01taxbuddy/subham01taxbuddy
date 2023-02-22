import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSalaryIncomeComponent } from './all-salary-income.component';

describe('AllSalaryIncomeComponent', () => {
  let component: AllSalaryIncomeComponent;
  let fixture: ComponentFixture<AllSalaryIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllSalaryIncomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllSalaryIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
