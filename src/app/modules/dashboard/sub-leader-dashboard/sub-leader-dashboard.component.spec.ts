import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubLeaderDashboardComponent } from './sub-leader-dashboard.component';

describe('SubLeaderDashboardComponent', () => {
  let component: SubLeaderDashboardComponent;
  let fixture: ComponentFixture<SubLeaderDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubLeaderDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubLeaderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
