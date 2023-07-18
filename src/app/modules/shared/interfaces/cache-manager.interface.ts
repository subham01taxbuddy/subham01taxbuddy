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
    console.log(this.cache[0])
  }

  getPageContent(pageNumber: number): any[] | null {
    const page = this.cache.find(p => p.pageNumber === pageNumber);
    console.log('page',page)
    console.log('page wise data ',page?.pageContent)
    return page ? page.pageContent : null;
  }

  cachePageContent(pageNumber: number, pageContent: any[]): void {
      const page = this.cache.find(p => p.pageNumber === pageNumber);
      if (page) {
        page.pageContent = pageContent;
        console.log('saved page content' ,pageNumber,pageContent)
      } else {
        if(this.cache.length <= 5 ){
          this.cache.push({
            pageNumber,
            pageContent
          });
        }else{
          return;
        }


    }
    console.log('saved page content', pageContent)

  }

  clearCache() {
    this.cache = [];
  }
}
