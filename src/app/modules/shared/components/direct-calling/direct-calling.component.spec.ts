import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectCallingComponent } from './direct-calling.component';

describe('DirectCallingComponent', () => {
  let component: DirectCallingComponent;
  let fixture: ComponentFixture<DirectCallingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DirectCallingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectCallingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
