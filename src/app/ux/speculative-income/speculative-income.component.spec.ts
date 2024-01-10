import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeculativeIncomeComponent } from './speculative-income.component';

describe('SpeculativeIncomeComponent', () => {
  let component: SpeculativeIncomeComponent;
  let fixture: ComponentFixture<SpeculativeIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeculativeIncomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeculativeIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
