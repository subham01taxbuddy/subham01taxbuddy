import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsFooterComponent } from './actions-footer.component';

describe('ActionsFooterComponent', () => {
  let component: ActionsFooterComponent;
  let fixture: ComponentFixture<ActionsFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
