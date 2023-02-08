import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonSpeculativeIncomeComponent } from './non-speculative-income.component';

describe('NonSpeculativeIncomeComponent', () => {
  let component: NonSpeculativeIncomeComponent;
  let fixture: ComponentFixture<NonSpeculativeIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonSpeculativeIncomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NonSpeculativeIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
