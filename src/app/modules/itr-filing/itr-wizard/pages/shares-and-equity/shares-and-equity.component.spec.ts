import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAndEquityComponent } from './shares-and-equity.component';

describe('SharesAndEquityComponent', () => {
  let component: SharesAndEquityComponent;
  let fixture: ComponentFixture<SharesAndEquityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharesAndEquityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAndEquityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
