import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandBuildingComponent } from './land-building.component';

describe('LandBuildingComponent', () => {
  let component: LandBuildingComponent;
  let fixture: ComponentFixture<LandBuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandBuildingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
