import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReAssignActionDialogComponent } from './re-assign-action-dialog.component';

describe('ReAssignActionDialogComponent', () => {
  let component: ReAssignActionDialogComponent;
  let fixture: ComponentFixture<ReAssignActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReAssignActionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReAssignActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
