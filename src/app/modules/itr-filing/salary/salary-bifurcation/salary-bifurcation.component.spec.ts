import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryBifurcationComponent } from './salary-bifurcation.component';

describe('BifurcationComponent', () => {
  let component: SalaryBifurcationComponent;
  let fixture: ComponentFixture<SalaryBifurcationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryBifurcationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryBifurcationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
