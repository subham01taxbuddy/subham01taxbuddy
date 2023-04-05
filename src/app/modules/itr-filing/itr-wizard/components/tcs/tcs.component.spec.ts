import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TcsComponent } from './tcs.component';

describe('TcsComponent', () => {
  let component: TcsComponent;
  let fixture: ComponentFixture<TcsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TcsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TcsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
