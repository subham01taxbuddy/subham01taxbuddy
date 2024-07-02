import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {


  isLoading = new Subject<boolean>();

 

  open() {
    this.isLoading.next(true);
  }

  hide() {
    this.isLoading.next(false);
  }
}
