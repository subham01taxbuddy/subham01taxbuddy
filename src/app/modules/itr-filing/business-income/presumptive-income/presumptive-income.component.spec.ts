import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresumptiveIncomeComponent } from './presumptive-income.component';

describe('PresumptiveIncomeComponent', () => {
  let component: PresumptiveIncomeComponent;
  let fixture: ComponentFixture<PresumptiveIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresumptiveIncomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresumptiveIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
