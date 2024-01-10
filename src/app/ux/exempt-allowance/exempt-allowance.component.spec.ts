import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemptAllowanceComponent } from './exempt-allowance.component';

describe('ExemptAllowanceComponent', () => {
  let component: ExemptAllowanceComponent;
  let fixture: ComponentFixture<ExemptAllowanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExemptAllowanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExemptAllowanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
