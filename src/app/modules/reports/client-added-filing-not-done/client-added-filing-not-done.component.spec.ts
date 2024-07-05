/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ClientAddedFilingNotDoneComponent } from './client-added-filing-not-done.component';

describe('ClientAddedFilingNotDoneComponent', () => {
  let component: ClientAddedFilingNotDoneComponent;
  let fixture: ComponentFixture<ClientAddedFilingNotDoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientAddedFilingNotDoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAddedFilingNotDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
