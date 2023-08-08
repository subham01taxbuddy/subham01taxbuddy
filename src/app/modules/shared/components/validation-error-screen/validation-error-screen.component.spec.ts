import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationErrorScreenComponent } from './validation-error-screen.component';

describe('ValidationErrorScreenComponent', () => {
  let component: ValidationErrorScreenComponent;
  let fixture: ComponentFixture<ValidationErrorScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationErrorScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationErrorScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
