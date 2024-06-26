import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KommunicateSsoService {
  iframe: HTMLIFrameElement;

 


  loginKommunicateSdk(token) {
    let loginSmeDetails = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    const baseUrl = "https://dashboard-proxy.kommunicate.io";
    const userEmail = loginSmeDetails[0].email;
    const userAccessToken = `${token}&appId=${environment.kmAppId}`;
    let iframe = document.getElementById('km-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.setAttribute('class', 'iframe-height');
      iframe.setAttribute('id', 'km-iframe');
    }
    iframe.setAttribute('src', `${baseUrl}/login?email=${userEmail}&loginType=custom&password=${userAccessToken}&showConversationSectionOnly=true`)
    if (!document.getElementById('km-iframe')) {
      let viewbox = document.getElementById('km-viewbox');
      viewbox.append(iframe);
    }
  }

  openConversation(id) {
    let loginSmeDetails = JSON.parse(sessionStorage.getItem('LOGGED_IN_SME_INFO'));
    const baseUrl = "https://dashboard-proxy.kommunicate.io";
    const userEmail = loginSmeDetails[0].email;
    const userAccessToken = `${sessionStorage.getItem("kmAuthToken")}&appId=${environment.kmAppId}`;
    const groupToOpen = id;
    this.iframe = document.getElementById('km-iframe') as HTMLIFrameElement;
    if (!this.iframe) {
      this.iframe = document.createElement("iframe");
      this.iframe.setAttribute('class', 'iframe-height');
      this.iframe.setAttribute('id', 'km-iframe');
    }
    this.iframe.setAttribute('src', `${baseUrl}/conversations/${groupToOpen}?showConversationSectionOnly=true`)
    if (!document.getElementById('km-iframe')) {
      let viewbox = document.getElementById('km-viewbox');
      viewbox.append(this.iframe);
    }
    (document.getElementById('km-viewbox') as HTMLElement).style.display = 'block';
  }

  logoutKommunicateChat() {
    const baseUrl = "https://api.kommunicate.io/users/logout";
    this.iframe = document.getElementById('km-iframe') as HTMLIFrameElement;
    if (!this.iframe) {
      this.iframe = document.createElement("iframe");
      this.iframe.setAttribute('class', 'iframe-height');
      this.iframe.setAttribute('id', 'km-iframe');
    }
    this.iframe.setAttribute('src', `${baseUrl}`)
    if (!document.getElementById('km-iframe')) {
      let viewbox = document.getElementById('km-viewbox');
      viewbox.append(this.iframe);
    }
    (document.getElementById('km-viewbox') as HTMLElement).style.display = 'none';
  }
}
