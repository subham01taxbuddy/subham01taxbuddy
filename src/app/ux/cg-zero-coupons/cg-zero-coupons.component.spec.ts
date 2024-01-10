import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CgZeroCouponsComponent } from './cg-zero-coupons.component';

describe('CgZeroCouponsComponent', () => {
  let component: CgZeroCouponsComponent;
  let fixture: ComponentFixture<CgZeroCouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CgZeroCouponsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CgZeroCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
