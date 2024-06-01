/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FillingDonePaymentNotReceivedComponent } from './filling-done-payment-not-received.component';

describe('FillingDonePaymentNotReceivedComponent', () => {
  let component: FillingDonePaymentNotReceivedComponent;
  let fixture: ComponentFixture<FillingDonePaymentNotReceivedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FillingDonePaymentNotReceivedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillingDonePaymentNotReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
