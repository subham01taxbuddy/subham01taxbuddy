/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LabFormComponent } from './lab-form.component';

describe('LabFormComponent', () => {
  let component: LabFormComponent;
  let fixture: ComponentFixture<LabFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
