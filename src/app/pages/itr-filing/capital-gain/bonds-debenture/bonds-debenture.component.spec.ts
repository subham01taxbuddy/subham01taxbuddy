import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondsDebentureComponent } from './bonds-debenture.component';

describe('BondsDebentureComponent', () => {
  let component: BondsDebentureComponent;
  let fixture: ComponentFixture<BondsDebentureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BondsDebentureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BondsDebentureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
