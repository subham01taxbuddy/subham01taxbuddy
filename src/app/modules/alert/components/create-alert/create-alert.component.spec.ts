import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAlertComponent } from './create-alert.component';

describe('CreateAlertComponent', () => {
  let component: CreateAlertComponent;
  let fixture: ComponentFixture<CreateAlertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateAlertComponent]
    });
    fixture = TestBed.createComponent(CreateAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
