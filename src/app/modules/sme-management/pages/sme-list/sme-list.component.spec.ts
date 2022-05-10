/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SmeListComponent } from './sme-list.component';

describe('SmeListComponent', () => {
  let component: SmeListComponent;
  let fixture: ComponentFixture<SmeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
