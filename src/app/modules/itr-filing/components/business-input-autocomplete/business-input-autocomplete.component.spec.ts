import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessInputAutocompleteComponent } from './business-input-autocomplete.component';

describe('BusinessInputAutocompleteComponent', () => {
  let component: BusinessInputAutocompleteComponent;
  let fixture: ComponentFixture<BusinessInputAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessInputAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessInputAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
