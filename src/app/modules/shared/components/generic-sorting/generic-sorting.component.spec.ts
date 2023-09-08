import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSortingComponent } from './generic-sorting.component';

describe('GenericSortingComponent', () => {
  let component: GenericSortingComponent;
  let fixture: ComponentFixture<GenericSortingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericSortingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
