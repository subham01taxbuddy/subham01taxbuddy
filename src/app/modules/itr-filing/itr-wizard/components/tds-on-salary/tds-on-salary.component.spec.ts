import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdsOnSalaryComponent } from './tds-on-salary.component';

describe('TdsOnSalaryComponent', () => {
  let component: TdsOnSalaryComponent;
  let fixture: ComponentFixture<TdsOnSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TdsOnSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdsOnSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
