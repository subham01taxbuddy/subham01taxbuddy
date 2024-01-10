import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreInfoCflComponent } from './more-info-cfl.component';

describe('MoreInfoCflComponent', () => {
  let component: MoreInfoCflComponent;
  let fixture: ComponentFixture<MoreInfoCflComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoreInfoCflComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreInfoCflComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
