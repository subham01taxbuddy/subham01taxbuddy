import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondsDebentures } from './bonds-debentures';

describe('ZeroCouponBondsComponent', () => {
  let component: BondsDebentures;
  let fixture: ComponentFixture<BondsDebentures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BondsDebentures ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BondsDebentures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
