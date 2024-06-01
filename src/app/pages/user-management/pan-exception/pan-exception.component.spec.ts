/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PanExceptionComponent } from './pan-exception.component';

describe('PanExceptionComponent', () => {
  let component: PanExceptionComponent;
  let fixture: ComponentFixture<PanExceptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanExceptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanExceptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
