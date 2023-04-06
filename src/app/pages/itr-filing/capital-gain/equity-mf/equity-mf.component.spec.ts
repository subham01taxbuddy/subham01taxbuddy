/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EquityMfComponent } from './equity-mf.component';

describe('EquityMfComponent', () => {
  let component: EquityMfComponent;
  let fixture: ComponentFixture<EquityMfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquityMfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquityMfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
