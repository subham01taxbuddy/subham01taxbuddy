import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresumptiveProfessionalIncomeComponent } from './presumptive-professional-income.component';

describe('PresumptiveProfessionalIncomeComponent', () => {
  let component: PresumptiveProfessionalIncomeComponent;
  let fixture: ComponentFixture<PresumptiveProfessionalIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresumptiveProfessionalIncomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresumptiveProfessionalIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
