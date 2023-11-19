import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleFaComponent } from './schedule-fa.component';

describe('ScheduleFaComponent', () => {
  let component: ScheduleFaComponent;
  let fixture: ComponentFixture<ScheduleFaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleFaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleFaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
