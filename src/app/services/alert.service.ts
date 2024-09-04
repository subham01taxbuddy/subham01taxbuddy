import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, interval, Observable, timer} from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from './storage.service';

export interface Alert {
  alertId:string,
 // filter: any;
  type: string;
  message: string;
  title: string;
  applicableFrom: Date;
  applicableTo: Date;
  seen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  microService: string = '/user';
  private headers: HttpHeaders;
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  alerts$ = this.alertsSubject.asObservable();
  private newAlertsSubject = new BehaviorSubject<Alert[]>([]);
  newAlerts$ = this.newAlertsSubject.asObservable();
  private periodicAlertsSubject = new BehaviorSubject<Alert[]>([]);
  periodicAlerts$ = this.periodicAlertsSubject.asObservable();
  private readonly READ_ALERTS_KEY = 'ReadAlertData';
 // alertData:any;

  constructor(private http: HttpClient, private sessionStorage:SessionStorageService) {
    this.headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.fetchAlerts();
    this.startPeriodicAlerts();
    this.startAutoRemoveExpiredAlerts();

  }

  postMethodAlert(alertData: any): Observable<any> {
    return this.http.post(
      `${environment.url}${this.microService}/api-alert/create`,
      alertData,
      { headers: this.headers }
    ).pipe(
      tap((newAlert: Alert) => {
        const currentAlerts = this.alertsSubject.value;
        this.alertsSubject.next([...currentAlerts, newAlert]);
      })
    );
  }

  fetchAlerts() {
    this.getAllAlert().subscribe();
  }

  getAllAlert(): Observable<Alert[]> {
    return this.http.get<Alert[]>(
      `${environment.url}${this.microService}/api-alert/All-active`,
      { headers: this.headers }
    ).pipe(
      tap(alerts => {
        const currentAlerts = this.alertsSubject.value;
        const newAlerts = alerts.filter(alert =>
          !currentAlerts.some(currentAlert =>
            currentAlert.title === alert.title &&
            currentAlert.message === alert.message
          )
        );
        this.alertsSubject.next(alerts);
        if (newAlerts.length > 0) {
          this.newAlertsSubject.next(newAlerts);
        }
      })
    );
  }

  removeExpiredAlerts<T>(): Observable<T> {
    this.headers = new HttpHeaders();
    this.headers.append('Content-Type', 'application/json');
    return this.http.delete<T>(
      environment.url + this.microService + `/api-alert/expired`, { headers: this.headers });
  }


  private startPeriodicAlerts() {
    interval(600000).pipe(
      tap(() => {
        const currentAlerts = this.alertsSubject.value;
        const readAlerts = this.getReadAlerts();
        const unreadAlerts = currentAlerts.filter(alert => !readAlerts.includes(alert.alertId));
        const criticalAlerts = unreadAlerts.filter(alert => alert.type === 'CRITICAL');
        const otherAlerts = unreadAlerts.filter(alert => alert.type !== 'CRITICAL');
        this.periodicAlertsSubject.next([
          ...(criticalAlerts.length > 0 ? [criticalAlerts[0]] : []),
          ...otherAlerts.slice(0, 5)
        ]);
      })
    ).subscribe();
  }

  private startAutoRemoveExpiredAlerts() {
    timer(0, 60000).pipe( // Check every minute
      switchMap(() => this.getAllAlert())
    ).subscribe(alerts => {
      const currentTime = new Date().getTime();
      const activeAlerts = alerts.filter(alert => new Date(alert.applicableTo).getTime() > currentTime);
      
      if (activeAlerts.length !== alerts.length) {
        this.removeExpiredAlerts().subscribe({
          next: () => {
            console.log('Expired alerts removed successfully');
            this.alertsSubject.next(activeAlerts);
          },
          error: (error) => {
            console.error('Error removing expired alerts:', error);
          }
        });
      }
    });
  }

  updateAlerts(alerts: Alert[]) {
    this.alertsSubject.next(alerts);
  }

  markAlertAsRead(alertId: string) {
    const readAlerts = this.getReadAlerts();
    if (!readAlerts.includes(alertId)) {
      readAlerts.push(alertId);
      sessionStorage.setItem(this.READ_ALERTS_KEY, JSON.stringify(readAlerts));
    }
  }

  private getReadAlerts(): string[] {
    const readAlertsString = sessionStorage.getItem(this.READ_ALERTS_KEY);
    return readAlertsString ? JSON.parse(readAlertsString) : [];
  }

}


