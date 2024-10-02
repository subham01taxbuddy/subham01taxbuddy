import { TestBed } from '@angular/core/testing';

import { UserTaxDataService } from './user-tax-data.service';

describe('UserTaxDataService', () => {
  let service: UserTaxDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTaxDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
