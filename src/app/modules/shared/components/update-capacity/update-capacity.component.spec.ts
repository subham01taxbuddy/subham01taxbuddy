import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCapacityComponent } from './update-capacity.component';

describe('UpdateCapacityComponent', () => {
  let component: UpdateCapacityComponent;
  let fixture: ComponentFixture<UpdateCapacityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateCapacityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
