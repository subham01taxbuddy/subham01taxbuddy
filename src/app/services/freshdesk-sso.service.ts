import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FreshDeskSsoService {

constructor() {

 }

 loginFreshDesk(){
  //https://taxbuddy.freshdesk.com/api/widget/solutions/suggested_articles?language=en
  let loginSmeDetails = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
  const baseUrl = "https://taxbuddy.freshdesk.com/api/widget/solutions/suggested_articles?language=en";
  const userEmail = loginSmeDetails[0].email;


 }

}
