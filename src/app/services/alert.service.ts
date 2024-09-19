import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, interval, Observable, Subscription, timer} from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from './storage.service';

export interface Alert {
  activeFrom: string | number | Date;
  alertId:string,
  type: string;
  message: string;
  title: string;
  applicableFrom: Date;
  applicableTo: Date;
  popupShown?: boolean; 
  seen:boolean;
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
  private readonly READ_ALERTS_KEY = 'readAlerts';
  private readonly POPUP_SHOWN_ALERTS_KEY = 'popupShownAlerts';
 

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
        if (newAlerts.length > 0 ) { 
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
  
  isAlertRead(alertId: string): boolean {
    const readAlerts = this.getReadAlerts();
    return readAlerts.includes(alertId);
  }
 private isAlertActive(alert: Alert, currentTime: Date): boolean {
    const applicableFrom = new Date(alert.applicableFrom);
    const applicableTo = new Date(alert.applicableTo);
    return currentTime >= applicableFrom && currentTime <= applicableTo;
  }

  updateAlerts(alerts: Alert[]) {
    this.alertsSubject.next(alerts);
  }
  
  markAlertAsRead(alert: Alert) {
    const count = 0;
    const readAlerts = this.getReadAlerts();
    if (!readAlerts.some(readAlert => readAlert.alertId === alert.alertId)) {
      readAlerts.push({
        alertId: alert.alertId,
        title: alert.title,
        message: alert.message
      });
    }
    const currentAlerts = this.alertsSubject.value;
    const updatedAlerts = currentAlerts.map(a => 
      a.alertId === alert.alertId ? { ...a, seen: true } : a
    );
    this.alertsSubject.next(updatedAlerts);
  }

  interval:any;

  startPeriodicAlerts() {
    this.interval = interval(60000);
    this.interval.pipe(
      switchMap(() => this.getAllAlert()),
      tap(() => {
        const currentTime = new Date();
        const currentAlerts = this.alertsSubject.value;
        const readAlerts = this.getReadAlerts();
        const popupShownAlerts = this.getPopupShownAlerts();
        
        const activeAlerts = currentAlerts.filter(alert =>
          this.isAlertActive(alert, currentTime) &&
          !readAlerts.some(readAlert => readAlert.alertId === alert.alertId)
          // !popupShownAlerts.includes(alert.alertId)
        );

        activeAlerts.forEach(alert => {
         const alertActivationTime = new Date(alert.applicableFrom);
         const delayInMs = Math.max(0, alertActivationTime.getTime() + 60000 - currentTime.getTime());
          
          timer(delayInMs).subscribe(() => {
            if (!this.getPopupShownAlerts().includes(alert.alertId)) {
              this.periodicAlertsSubject.next([alert]);
            }
          });
        });
      })
    ).subscribe();
  }

  private getPopupShownAlerts(): string[] {
    const popupShownAlertsString = this.sessionStorage.getItem(this.POPUP_SHOWN_ALERTS_KEY);
   return popupShownAlertsString ? JSON.parse(popupShownAlertsString) : [];

  }

  private getReadAlerts(): any[] {
    const readAlertsString = sessionStorage.getItem(this.READ_ALERTS_KEY);
    return readAlertsString ? JSON.parse(readAlertsString) : [];
  } 

  private startAutoRemoveExpiredAlerts() {
    timer(0, 30000).pipe( 
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

  stopService(){
      clearInterval(this.interval);
  }

}
