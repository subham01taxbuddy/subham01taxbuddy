import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdsOtherThanSalaryComponent } from './tds-other-than-salary.component';

describe('TdsOtherThanSalaryComponent', () => {
  let component: TdsOtherThanSalaryComponent;
  let fixture: ComponentFixture<TdsOtherThanSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TdsOtherThanSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdsOtherThanSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
