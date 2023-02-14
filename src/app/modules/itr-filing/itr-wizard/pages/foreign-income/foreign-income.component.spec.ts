import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeignIncomeComponent } from './foreign-income.component';

describe('ForeignIncomeComponentComponent', () => {
  let component: ForeignIncomeComponent;
  let fixture: ComponentFixture<ForeignIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForeignIncomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForeignIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
