/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MissedInboundCallsComponent } from './missed-inbound-calls.component';

describe('MissedInboundCallsComponent', () => {
  let component: MissedInboundCallsComponent;
  let fixture: ComponentFixture<MissedInboundCallsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissedInboundCallsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissedInboundCallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
