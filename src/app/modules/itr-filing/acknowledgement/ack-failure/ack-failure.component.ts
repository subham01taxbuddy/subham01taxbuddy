import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-ack-failure',
  templateUrl: './ack-failure.component.html',
  styleUrls: ['./ack-failure.component.scss']
})
export class AckFailureComponent {

  constructor(public utilsService: UtilsService, private router: Router) { }

  previousRoute() {
    this.router.navigate(['/pages/itr-filing/users']);
  }

}
