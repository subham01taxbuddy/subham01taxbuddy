import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBalanceSheetComponent } from './add-balance-sheet.component';

describe('AddBalanceSheetComponent', () => {
  let component: AddBalanceSheetComponent;
  let fixture: ComponentFixture<AddBalanceSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBalanceSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBalanceSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
