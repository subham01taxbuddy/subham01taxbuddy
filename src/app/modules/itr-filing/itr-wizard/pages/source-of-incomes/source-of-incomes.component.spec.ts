import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceOfIncomesComponent } from './source-of-incomes.component';

describe('SourceOfIncomesComponent', () => {
  let component: SourceOfIncomesComponent;
  let fixture: ComponentFixture<SourceOfIncomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceOfIncomesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceOfIncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
