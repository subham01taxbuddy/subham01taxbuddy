/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MissedInboundCallListComponent } from './missed-inbound-call-list.component';

describe('MissedInboundCallListComponent', () => {
  let component: MissedInboundCallListComponent;
  let fixture: ComponentFixture<MissedInboundCallListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissedInboundCallListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissedInboundCallListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
