/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SpeculativeMainComponent } from './speculative-main.component';

describe('SpeculativeMainComponent', () => {
  let component: SpeculativeMainComponent;
  let fixture: ComponentFixture<SpeculativeMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeculativeMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeculativeMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
