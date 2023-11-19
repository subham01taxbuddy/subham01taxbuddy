import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleVdaComponent } from './schedule-vda.component';

describe('ScheduleVdaComponent', () => {
  let component: ScheduleVdaComponent;
  let fixture: ComponentFixture<ScheduleVdaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleVdaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleVdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
