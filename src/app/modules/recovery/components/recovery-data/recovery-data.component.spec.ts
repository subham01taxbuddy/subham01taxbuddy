import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryDataComponent } from './recovery-data.component';

describe('RecoveryDataComponent', () => {
  let component: RecoveryDataComponent;
  let fixture: ComponentFixture<RecoveryDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecoveryDataComponent]
    });
    fixture = TestBed.createComponent(RecoveryDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
