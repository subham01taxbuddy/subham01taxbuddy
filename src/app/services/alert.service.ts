import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, interval, Observable, timer } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Alert {
  filter: any;
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

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.fetchAlerts();
    //commented periodic alert code for now
    // this.startPeriodicAlerts();

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

  private startPeriodicAlerts() {
    interval(600000).pipe(
      tap(() => {
        const currentAlerts = this.alertsSubject.value;
        const criticalAlerts = currentAlerts.filter(alert => alert.type === 'CRITICAL');
        const otherAlerts = currentAlerts.filter(alert => alert.type !== 'CRITICAL');
        this.periodicAlertsSubject.next([
          ...(criticalAlerts.length > 0 ? [criticalAlerts[0]] : []),
          ...otherAlerts.slice(0, 5)
        ]);
      })
    ).subscribe();
  }


}


