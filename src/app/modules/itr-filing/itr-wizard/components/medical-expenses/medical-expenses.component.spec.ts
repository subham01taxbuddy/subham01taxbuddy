import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalExpensesComponent } from './medical-expenses.component';

describe('MedicalExpensesComponent', () => {
  let component: MedicalExpensesComponent;
  let fixture: ComponentFixture<MedicalExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalExpensesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
