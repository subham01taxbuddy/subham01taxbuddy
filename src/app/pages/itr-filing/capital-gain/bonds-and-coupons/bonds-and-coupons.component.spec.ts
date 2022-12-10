import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondsAndCouponsComponent } from './bonds-and-coupons.component';

describe('BondsAndCouponsComponent', () => {
  let component: BondsAndCouponsComponent;
  let fixture: ComponentFixture<BondsAndCouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BondsAndCouponsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BondsAndCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
