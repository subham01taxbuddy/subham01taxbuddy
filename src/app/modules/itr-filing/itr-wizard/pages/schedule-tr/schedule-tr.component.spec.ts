import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTrComponent } from './schedule-tr.component';

describe('ScheduleTrComponent', () => {
  let component: ScheduleTrComponent;
  let fixture: ComponentFixture<ScheduleTrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleTrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleTrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
