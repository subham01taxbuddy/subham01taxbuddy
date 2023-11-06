import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() { }

  /**
   * used to add/update properties
   * @param key key name to be stored in localstorage
   * @param value value against that key
   * @param isStringify if the value is object or array then isStringify would be true or false
   */

  setItem(key: any, value: any, isStringify: boolean = false) {
    value = isStringify ? JSON.stringify(value) : value;
    localStorage.setItem(key, value);
  }

  /**
   * used to retrive the value from localstorage
   * @param key 
   * @returns value of the key
   */

  getItem(key: string, isParsed: boolean = false) {
    if (isParsed) {
      return JSON.parse(localStorage.getItem(key) as any) || null;
    }
    return localStorage.getItem(key) || null;
  }

  /**
   * used to remove value from the localstorage
   * @param key 
   */

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  /**
   * used to remove all the values from localstorage
   */

  clear() {
    localStorage.clear();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  constructor() { }

  /**
   * used to add/update properties
   * @param key key name to be stored in sessionStorage
   * @param value value against that key
   * @param isStringify if the value is object or array then isStringify would be true or false
   */

  setItem(key: any, value: any, isStringify: boolean = false) {
    value = isStringify ? JSON.stringify(value) : value;
    sessionStorage.setItem(key, value);
  }

  /**
   * used to retrive the value from sessionStorage
   * @param key 
   * @returns value of the key
   */

  getItem(key: string, isParsed: boolean = false) {
    if (isParsed) {
      return JSON.parse(sessionStorage.getItem(key) as any) || null;
    }
    return sessionStorage.getItem(key) || null;
  }

  /**
   * used to remove value from the sessionStorage
   * @param key 
   */

  removeItem(key: string) {
    sessionStorage.removeItem(key);
  }

  /**
   * used to remove all the values from sessionStorage
   */

  clear() {
    sessionStorage.clear();
  }
}