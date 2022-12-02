import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeductionSecondComponent } from './add-deduction-second.component';

describe('AddDeductionSecondComponent', () => {
  let component: AddDeductionSecondComponent;
  let fixture: ComponentFixture<AddDeductionSecondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDeductionSecondComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDeductionSecondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
