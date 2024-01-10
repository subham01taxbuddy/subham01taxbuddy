import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreInfoScheduleAlComponent } from './more-info-schedule-al.component';

describe('MoreInfoScheduleAlComponent', () => {
  let component: MoreInfoScheduleAlComponent;
  let fixture: ComponentFixture<MoreInfoScheduleAlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreInfoScheduleAlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreInfoScheduleAlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
