import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderAttendanceDashboardComponent } from './leader-attendance-dashboard.component';

describe('LeaderAttendanceDashboardComponent', () => {
  let component: LeaderAttendanceDashboardComponent;
  let fixture: ComponentFixture<LeaderAttendanceDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderAttendanceDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderAttendanceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
