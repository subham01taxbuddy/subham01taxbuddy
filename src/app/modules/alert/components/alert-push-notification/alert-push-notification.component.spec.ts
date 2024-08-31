import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertPushNotificationComponent } from './alert-push-notification.component';

describe('AlertPushNotificationComponent', () => {
  let component: AlertPushNotificationComponent;
  let fixture: ComponentFixture<AlertPushNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlertPushNotificationComponent]
    });
    fixture = TestBed.createComponent(AlertPushNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
