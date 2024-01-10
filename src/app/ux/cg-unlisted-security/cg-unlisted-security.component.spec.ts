import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CgUnlistedSecurityComponent } from './cg-unlisted-security.component';

describe('CgUnlistedSecurityComponent', () => {
  let component: CgUnlistedSecurityComponent;
  let fixture: ComponentFixture<CgUnlistedSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CgUnlistedSecurityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CgUnlistedSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
