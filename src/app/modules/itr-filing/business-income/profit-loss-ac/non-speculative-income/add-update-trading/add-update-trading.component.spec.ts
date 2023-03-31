import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateTradingComponent } from './add-update-trading.component';

describe('AddUpdateTradingComponent', () => {
  let component: AddUpdateTradingComponent;
  let fixture: ComponentFixture<AddUpdateTradingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateTradingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateTradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
