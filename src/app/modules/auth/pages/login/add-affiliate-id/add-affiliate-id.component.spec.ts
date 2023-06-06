import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAffiliateIdComponent } from './add-affiliate-id.component';

describe('AddAffiliateIdComponent', () => {
  let component: AddAffiliateIdComponent;
  let fixture: ComponentFixture<AddAffiliateIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAffiliateIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAffiliateIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
