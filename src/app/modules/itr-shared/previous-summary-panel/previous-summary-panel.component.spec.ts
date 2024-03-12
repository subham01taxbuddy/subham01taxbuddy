import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousSummaryPanelComponent } from './previous-summary-panel.component';

describe('PreviousSummaryPanelComponent', () => {
  let component: PreviousSummaryPanelComponent;
  let fixture: ComponentFixture<PreviousSummaryPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviousSummaryPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousSummaryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
