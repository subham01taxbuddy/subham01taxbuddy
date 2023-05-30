/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MissedChatReportComponent } from './missed-chat-report.component';

describe('MissedChatReportComponent', () => {
  let component: MissedChatReportComponent;
  let fixture: ComponentFixture<MissedChatReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissedChatReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissedChatReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
