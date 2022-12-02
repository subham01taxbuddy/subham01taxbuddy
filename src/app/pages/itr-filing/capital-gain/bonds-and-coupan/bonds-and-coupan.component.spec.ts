import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BondsAndCoupanComponent } from './bonds-and-coupan.component';

describe('BondsAndCoupanComponent', () => {
  let component: BondsAndCoupanComponent;
  let fixture: ComponentFixture<BondsAndCoupanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BondsAndCoupanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BondsAndCoupanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
