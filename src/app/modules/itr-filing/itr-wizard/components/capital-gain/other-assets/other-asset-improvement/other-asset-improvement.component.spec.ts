import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherAssetImprovementComponent } from './other-asset-improvement.component';

describe('OtherAssetImprovementComponent', () => {
  let component: OtherAssetImprovementComponent;
  let fixture: ComponentFixture<OtherAssetImprovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherAssetImprovementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherAssetImprovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
