import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingWidgetComponent } from './floating-widget.component';

describe('FloatingWidgetComponent', () => {
  let component: FloatingWidgetComponent;
  let fixture: ComponentFixture<FloatingWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
