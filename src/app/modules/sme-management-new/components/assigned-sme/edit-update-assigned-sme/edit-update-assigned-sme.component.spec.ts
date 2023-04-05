/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditUpdateAssignedSmeComponent } from './edit-update-assigned-sme.component';

describe('EditUpdateAssignedSmeComponent', () => {
  let component: EditUpdateAssignedSmeComponent;
  let fixture: ComponentFixture<EditUpdateAssignedSmeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditUpdateAssignedSmeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUpdateAssignedSmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
