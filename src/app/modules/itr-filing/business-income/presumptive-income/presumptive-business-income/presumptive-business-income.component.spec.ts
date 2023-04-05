import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresumptiveBusinessIncomeComponent } from './presumptive-business-income.component';

describe('PresumptiveBusinessIncomeComponent', () => {
  let component: PresumptiveBusinessIncomeComponent;
  let fixture: ComponentFixture<PresumptiveBusinessIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresumptiveBusinessIncomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresumptiveBusinessIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
