import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSmeDialogComponent } from './update-sme-dialog.component';

describe('UpdateSmeDialogComponent', () => {
  let component: UpdateSmeDialogComponent;
  let fixture: ComponentFixture<UpdateSmeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateSmeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateSmeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
