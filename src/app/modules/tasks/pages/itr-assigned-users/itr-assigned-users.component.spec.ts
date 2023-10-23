import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItrAssignedUsersComponent } from './itr-assigned-users.component';

describe('ItrAssignedUsersComponent', () => {
  let component: ItrAssignedUsersComponent;
  let fixture: ComponentFixture<ItrAssignedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItrAssignedUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItrAssignedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
