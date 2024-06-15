/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FilingSlaComponent } from './filing-sla.component';

describe('FilingSlaComponent', () => {
  let component: FilingSlaComponent;
  let fixture: ComponentFixture<FilingSlaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilingSlaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilingSlaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
