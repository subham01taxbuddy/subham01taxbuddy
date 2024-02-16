import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchCallCalenderComponent } from './sch-call-calender.component';

describe('SchCallCalenderComponent', () => {
  let component: SchCallCalenderComponent;
  let fixture: ComponentFixture<SchCallCalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchCallCalenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchCallCalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
