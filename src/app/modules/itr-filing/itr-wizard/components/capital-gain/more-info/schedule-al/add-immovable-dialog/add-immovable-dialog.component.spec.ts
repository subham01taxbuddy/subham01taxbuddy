import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImmovableDialogComponent } from './add-immovable-dialog.component';

describe('AddImmovableDialogComponent', () => {
  let component: AddImmovableDialogComponent;
  let fixture: ComponentFixture<AddImmovableDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImmovableDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddImmovableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
