import { Injectable } from '@angular/core';

interface CachePage {
  pageNumber: number;
  pageContent: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CacheManager {
  private cache: any[];

  constructor() {
    this.cache = [];
  }

  initializeCache(initialData: any[] = []) {
    this.cache[0] = initialData;
  }

  getPageContent(pageNumber: number): any[] | null {
    const page = this.cache.find(p => p.pageNumber === pageNumber);
    return page ? page.pageContent : null;
  }

  cachePageContent(pageNumber: number, pageContent: any[]): void {
    const page = this.cache.find(p => p.pageNumber === pageNumber);
    if (page) {
      page.pageContent = pageContent;
    } else {
      this.cache.push({
        pageNumber,
        pageContent
      });
    }
  }
}
