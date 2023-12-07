import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertToExtPartnerComponent } from './convert-to-ext-partner.component';

describe('ConvertToExtPartnerComponent', () => {
  let component: ConvertToExtPartnerComponent;
  let fixture: ComponentFixture<ConvertToExtPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvertToExtPartnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertToExtPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
