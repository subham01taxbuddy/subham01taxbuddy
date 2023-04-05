import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleCflComponent } from './schedule-cfl.component';

describe('ScheduleCflComponent', () => {
  let component: ScheduleCflComponent;
  let fixture: ComponentFixture<ScheduleCflComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleCflComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleCflComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
