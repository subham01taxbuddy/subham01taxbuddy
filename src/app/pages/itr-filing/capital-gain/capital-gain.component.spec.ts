import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapitalGainComponent } from './capital-gain.component';

describe('CapitalGainComponent', () => {
  let component: CapitalGainComponent;
  let fixture: ComponentFixture<CapitalGainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapitalGainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapitalGainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
