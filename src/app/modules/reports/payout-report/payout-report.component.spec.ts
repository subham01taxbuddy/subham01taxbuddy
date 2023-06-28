/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PayoutReportComponent } from './payout-report.component';

describe('PayoutReportComponent', () => {
  let component: PayoutReportComponent;
  let fixture: ComponentFixture<PayoutReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
