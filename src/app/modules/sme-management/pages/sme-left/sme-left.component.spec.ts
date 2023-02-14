import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmeLeftComponent } from './sme-left.component';

describe('SmeLeftComponent', () => {
  let component: SmeLeftComponent;
  let fixture: ComponentFixture<SmeLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmeLeftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmeLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
