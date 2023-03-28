import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldVsNewComponent } from './old-vs-new.component';

describe('OldVsNewComponent', () => {
  let component: OldVsNewComponent;
  let fixture: ComponentFixture<OldVsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OldVsNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OldVsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
