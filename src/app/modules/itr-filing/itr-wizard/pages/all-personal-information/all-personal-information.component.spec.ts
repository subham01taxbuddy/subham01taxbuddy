import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPersonalInformationComponent } from './all-personal-information.component';

describe('AllPersonalInformationComponent', () => {
  let component: AllPersonalInformationComponent;
  let fixture: ComponentFixture<AllPersonalInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllPersonalInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllPersonalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
