import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessIncomeComponent } from './business-income.component';

describe('BusinessIncomeComponent', () => {
  let component: BusinessIncomeComponent;
  let fixture: ComponentFixture<BusinessIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessIncomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
