/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UnassignedSmeComponent } from './unassigned-sme.component';

describe('UnassignedSmeComponent', () => {
  let component: UnassignedSmeComponent;
  let fixture: ComponentFixture<UnassignedSmeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnassignedSmeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnassignedSmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
