import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericUserFilterComponent } from './generic-user-filter.component';

describe('GenericUserFilterComponent', () => {
  let component: GenericUserFilterComponent;
  let fixture: ComponentFixture<GenericUserFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericUserFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericUserFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
