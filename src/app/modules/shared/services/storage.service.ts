import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  setLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getLocalStorage(key: string) {
    return JSON.parse((localStorage.getItem(key)) || 'null');
  }

  removeLocalStorage(key: string) {
    localStorage.removeItem(key);
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  setSessionStorage(key: string, value: string) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getSessionStorage(key: string) {
    return JSON.parse(JSON.stringify(sessionStorage.getItem(key)));
  }

  removeSessionStorage(key: string) {
    sessionStorage.removeItem(key);
  }

  clearSessionStorage() {
    sessionStorage.clear();
  }

  getItemFromCookies(key: string) {
    const name = key + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  setItem<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }


}
