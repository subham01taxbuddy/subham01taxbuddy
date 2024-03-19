import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() { }

  setItem(key: any, value: any, isStringify: boolean = false) {
    value = isStringify ? JSON.stringify(value) : value;
    localStorage.setItem(key, value);
  }

  getItem(key: string, isParsed: boolean = false) {
    if (isParsed) {
      return JSON.parse(localStorage.getItem(key) as any) || null;
    }
    return localStorage.getItem(key) || null;
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  constructor() { }

  setItem(key: any, value: any, isStringify: boolean = false) {
    value = isStringify ? JSON.stringify(value) : value;
    sessionStorage.setItem(key, value);
  }

  getItem(key: string, isParsed: boolean = false) {
    if (isParsed) {
      return JSON.parse(sessionStorage.getItem(key) as any) || null;
    }
    return sessionStorage.getItem(key) || null;
  }

  removeItem(key: string) {
    sessionStorage.removeItem(key);
  }

  clear() {
    sessionStorage.clear();
  }
}