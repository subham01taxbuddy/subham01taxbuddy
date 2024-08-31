import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, interval, Observable, timer } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Alert {
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
  private periodicAlertsSubject = new BehaviorSubject<Alert[]>([]);
  periodicAlerts$ = this.periodicAlertsSubject.asObservable();

  constructor(private http : HttpClient) { 
     this.headers = new HttpHeaders().set('Content-Type', 'application/json');
      //this.startPeriodicAlertFetch();
      //this.startPeriodicAlerts();
      this.initAlertPolling();
  }

  private initAlertPolling() {
    interval(60000) // Poll every minute
      .pipe(
        switchMap(() => this.getAllAlert())
      )
      .subscribe();
  }
  
  postMethodAlert(alertData: any): Observable<any> {
    return this.http.post(
      `${environment.url}${this.microService}/api-alert/create`,
      alertData,
      { headers: this.headers }
    ).pipe(
     // tap(() => this.getAllAlert().subscribe())
     tap((newAlert: Alert) => {
      const currentAlerts = this.alertsSubject.value;
      this.alertsSubject.next([...currentAlerts, newAlert]);
    })
    );
   }

  getAllAlert(): Observable<Alert[]> {
    return this.http.get<Alert[]>(
      `${environment.url}${this.microService}/api-alert/All-active`,
      { headers: this.headers }
    ).pipe(
      tap(alerts => this.alertsSubject.next(alerts))
    );
  }
  private filterCurrentAlerts(alerts: Alert[]): Alert[] {
    const now = new Date();
    return alerts.filter(alert => 
      alert.applicableFrom <= now && alert.applicableTo >= now
    );
  }

  // markAsSeen(alertId: string) {
  //   const currentAlerts = this.alertsSubject.value;
  //   const updatedAlerts = currentAlerts.map(alert => 
  //     alert.id === alertId ? { ...alert, seen: true } : alert
  //   );
  //   this.alertsSubject.next(updatedAlerts);
  // }




  // private startPeriodicAlertFetch() {
  //   timer(0, 600000).pipe(
  //     switchMap(() => this.getAllAlert())
  //   ).subscribe();
  // }
  // private startPeriodicAlerts() {
  //   interval(600000).pipe(
  //     tap(() => {
  //       const currentAlerts = this.alertsSubject.value;
  //       const criticalAlerts = currentAlerts.filter(alert => alert.type === 'CRITICAL');
  //       const otherAlerts = currentAlerts.filter(alert => alert.type !== 'CRITICAL');
  //       this.periodicAlertsSubject.next([
  //         ...(criticalAlerts.length > 0 ? [criticalAlerts[0]] : []),
  //         ...otherAlerts.slice(0, 5)
  //       ]);
  //     })
  //   ).subscribe();
  // }
  // fetchAlertsImmediately() {
  //   this.getAllAlert().subscribe();
  // }
}


