/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ScheduledCallReassignDialogComponent } from './scheduled-call-reassign-dialog.component';

describe('ScheduledCallReassignDialogComponent', () => {
  let component: ScheduledCallReassignDialogComponent;
  let fixture: ComponentFixture<ScheduledCallReassignDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduledCallReassignDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledCallReassignDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
