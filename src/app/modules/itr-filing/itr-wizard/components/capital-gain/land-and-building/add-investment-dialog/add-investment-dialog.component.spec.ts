import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestmentDialogComponent } from './add-investment-dialog.component';

describe('AddInvestmentDialogComponent', () => {
  let component: AddInvestmentDialogComponent;
  let fixture: ComponentFixture<AddInvestmentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddInvestmentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInvestmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
