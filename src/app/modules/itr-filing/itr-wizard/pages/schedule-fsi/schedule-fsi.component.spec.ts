import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleFsiComponent } from './schedule-fsi.component';

describe('ScheduleFsiComponent', () => {
  let component: ScheduleFsiComponent;
  let fixture: ComponentFixture<ScheduleFsiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleFsiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleFsiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
