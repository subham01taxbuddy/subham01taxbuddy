import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamReportDashboardComponent } from './team-report-dashboard.component';

describe('TeamReportDashboardComponent', () => {
  let component: TeamReportDashboardComponent;
  let fixture: ComponentFixture<TeamReportDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamReportDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamReportDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
