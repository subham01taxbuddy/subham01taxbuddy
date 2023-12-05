/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MissedChatListComponent } from './missed-chat-list.component';

describe('MissedChatListComponent', () => {
  let component: MissedChatListComponent;
  let fixture: ComponentFixture<MissedChatListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissedChatListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissedChatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
