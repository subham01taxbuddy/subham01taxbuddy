import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityDeductionComponent } from './security-deduction.component';

describe('SecurityDeductionComponent', () => {
  let component: SecurityDeductionComponent;
  let fixture: ComponentFixture<SecurityDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecurityDeductionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
