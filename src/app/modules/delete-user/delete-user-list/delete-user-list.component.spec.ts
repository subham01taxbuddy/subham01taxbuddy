import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteUserListComponent } from './delete-user-list.component';

describe('DeleteUserListComponent', () => {
  let component: DeleteUserListComponent;
  let fixture: ComponentFixture<DeleteUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteUserListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
