import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDropDownComponent } from './service-drop-down.component';

describe('ServiceDropDownComponent', () => {
  let component: ServiceDropDownComponent;
  let fixture: ComponentFixture<ServiceDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceDropDownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
