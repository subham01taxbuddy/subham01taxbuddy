import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitLossAcComponent } from './profit-loss-ac.component';

describe('ProfitLossAcComponent', () => {
  let component: ProfitLossAcComponent;
  let fixture: ComponentFixture<ProfitLossAcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfitLossAcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfitLossAcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
