import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepreciationDialogComponent } from './depreciation-dialog.component';


describe('DepreciationDialogComponent', () => {
  let component: DepreciationDialogComponent;
  let fixture: ComponentFixture<DepreciationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepreciationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepreciationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
