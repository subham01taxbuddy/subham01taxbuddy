import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherDeductionsComponent } from './other-deductions.component';

describe('OtherDeductionsComponent', () => {
  let component: OtherDeductionsComponent;
  let fixture: ComponentFixture<OtherDeductionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherDeductionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherDeductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
