import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CgBondsDebtsComponent } from './cg-bonds-debts.component';

describe('CgBondsDebtsComponent', () => {
  let component: CgBondsDebtsComponent;
  let fixture: ComponentFixture<CgBondsDebtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CgBondsDebtsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CgBondsDebtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
