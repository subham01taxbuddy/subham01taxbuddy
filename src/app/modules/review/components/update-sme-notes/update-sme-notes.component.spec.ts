import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSmeNotesComponent } from './update-sme-notes.component';

describe('UpdateSmeNotesComponent', () => {
  let component: UpdateSmeNotesComponent;
  let fixture: ComponentFixture<UpdateSmeNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateSmeNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateSmeNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
