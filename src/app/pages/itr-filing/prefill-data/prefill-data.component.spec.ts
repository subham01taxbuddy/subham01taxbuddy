/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrefillDataComponent } from './prefill-data.component';

describe('PrefillDataComponent', () => {
  let component: PrefillDataComponent;
  let fixture: ComponentFixture<PrefillDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrefillDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrefillDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
