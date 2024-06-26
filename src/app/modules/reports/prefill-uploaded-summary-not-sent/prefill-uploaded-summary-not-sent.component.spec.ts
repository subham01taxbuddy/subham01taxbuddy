/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrefillUploadedSummaryNotSentComponent } from './prefill-uploaded-summary-not-sent.component';

describe('PrefillUploadedSummaryNotSentComponent', () => {
  let component: PrefillUploadedSummaryNotSentComponent;
  let fixture: ComponentFixture<PrefillUploadedSummaryNotSentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrefillUploadedSummaryNotSentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrefillUploadedSummaryNotSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
