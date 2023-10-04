import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoVdaComponent } from './crypto-vda.component';

describe('CryptoVdaComponent', () => {
  let component: CryptoVdaComponent;
  let fixture: ComponentFixture<CryptoVdaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CryptoVdaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CryptoVdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
