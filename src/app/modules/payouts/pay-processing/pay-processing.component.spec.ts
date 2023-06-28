/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PayProcessingComponent } from './pay-processing.component';

describe('PayProcessingComponent', () => {
  let component: PayProcessingComponent;
  let fixture: ComponentFixture<PayProcessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayProcessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
