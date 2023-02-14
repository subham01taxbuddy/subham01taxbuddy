/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UnlistedSharesComponent } from './unlisted-shares.component';

describe('UnlistedSharesComponent', () => {
  let component: UnlistedSharesComponent;
  let fixture: ComponentFixture<UnlistedSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnlistedSharesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlistedSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
