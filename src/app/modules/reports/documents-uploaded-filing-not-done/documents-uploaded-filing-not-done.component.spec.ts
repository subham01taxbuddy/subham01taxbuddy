/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DocumentsUploadedFilingNotDoneComponent } from './documents-uploaded-filing-not-done.component';

describe('DocumentsUploadedFilingNotDoneComponent', () => {
  let component: DocumentsUploadedFilingNotDoneComponent;
  let fixture: ComponentFixture<DocumentsUploadedFilingNotDoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsUploadedFilingNotDoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsUploadedFilingNotDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
