import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefillIdComponent } from './prefill-id.component';

describe('PrefillIdComponent', () => {
  let component: PrefillIdComponent;
  let fixture: ComponentFixture<PrefillIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrefillIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrefillIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
