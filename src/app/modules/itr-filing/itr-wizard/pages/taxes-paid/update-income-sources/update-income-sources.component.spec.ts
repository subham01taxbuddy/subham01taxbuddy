import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateIncomeSourcesComponent } from './update-income-sources.component';

describe('UpdateIncomeSourcesComponent', () => {
  let component: UpdateIncomeSourcesComponent;
  let fixture: ComponentFixture<UpdateIncomeSourcesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateIncomeSourcesComponent]
    });
    fixture = TestBed.createComponent(UpdateIncomeSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
