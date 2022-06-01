/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SmeComponent } from './sme.component';

describe('SmeComponent', () => {
  let component: SmeComponent;
  let fixture: ComponentFixture<SmeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
