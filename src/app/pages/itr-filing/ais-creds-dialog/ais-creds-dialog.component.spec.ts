import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AisCredsDialogComponent } from './ais-creds-dialog.component';

describe('AisCredsDialogComponent', () => {
  let component: AisCredsDialogComponent;
  let fixture: ComponentFixture<AisCredsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AisCredsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AisCredsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
