/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ResignedSmeComponent } from './resigned-sme.component';

describe('ResignedSmeComponent', () => {
  let component: ResignedSmeComponent;
  let fixture: ComponentFixture<ResignedSmeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResignedSmeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResignedSmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
