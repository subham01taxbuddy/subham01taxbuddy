import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowlarityNotificationComponent } from './knowlarity-notification.component';

describe('KnowlarityNotificationComponent', () => {
  let component: KnowlarityNotificationComponent;
  let fixture: ComponentFixture<KnowlarityNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowlarityNotificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowlarityNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
