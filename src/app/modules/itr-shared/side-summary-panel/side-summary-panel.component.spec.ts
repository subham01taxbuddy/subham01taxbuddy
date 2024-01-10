import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideSummaryPanelComponent } from './side-summary-panel.component';

describe('SideSummaryPanelComponent', () => {
  let component: SideSummaryPanelComponent;
  let fixture: ComponentFixture<SideSummaryPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideSummaryPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideSummaryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
