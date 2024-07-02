import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManualUpdateReasonComponent } from './add-manual-update-reason.component';

describe('AddManualUpdateReasonComponent', () => {
  let component: AddManualUpdateReasonComponent;
  let fixture: ComponentFixture<AddManualUpdateReasonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddManualUpdateReasonComponent]
    });
    fixture = TestBed.createComponent(AddManualUpdateReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
