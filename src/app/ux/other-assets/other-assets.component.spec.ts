import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherAssetsComponent } from './other-assets.component';

describe('OtherAssetsComponent', () => {
  let component: OtherAssetsComponent;
  let fixture: ComponentFixture<OtherAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherAssetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
