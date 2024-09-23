import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';

// interface FragmentData {
//   fragmentName: string;
//   state: any;
//   id: string;
// }

// interface GroupedSnapshot {

//   version: string;
//   commitDate: string;
//   fragments: FragmentData[];
//   selected?: boolean;
// }
interface SnapshotItem {
  version: string;
  commitDate: string;
  fragmentName: string;
  state: any;
  id: string;
  selected: boolean;
}

@Component({
  selector: 'app-recovery-data',
  templateUrl: './recovery-data.component.html',
  styleUrls: ['./recovery-data.component.scss'],
})
export class RecoveryDataComponent {

  mobileNumber: string = '';
  loading : boolean = false;
  error: string | null = null;
  //private _isLoading = new BehaviorSubject<boolean>(false);
  //isLoading$: Observable<boolean> = this._isLoading.asObservable();

  jvSnapshots: any = [];
  selectedItems: string[] = [];
  //groupedSnapshots: GroupedSnapshot[] = [];
  isProcessingSnapshots: boolean = false;

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['version', 'fragment', 'state', 'commitDate'];

 // sendIds: any = [];
  snapshots: SnapshotItem[] = [];

  constructor(private http: HttpClient, private itrMs: ItrMsService, private userMsService: UserMsService,
    private utilService: UtilsService, private dialog: MatDialog) { }

  search() {
    this.loading = true;
    this.utilService.getFilerIdByMobile(this.mobileNumber).pipe(
      finalize(() => console.log('got Data'))
    ).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('api response', response);

        if (response && response.data && response.data.content && response.data.content.length > 0) {
          const openItrId = response.data.content[0].openItrId;

          if (openItrId) {
            this.fetchJvSnapshots(openItrId);
          } else {
            console.error('No itrId found in the response');
          }
        } else {
          console.error('Invalid response structure');
        }
      },
      (error) => {
        console.error('Error fetching filer ID', error);
      }
    );
  }

  fetchJvSnapshots(openItrId: string) {
    this.loading = true;
    this.itrMs.getJvSnapshots(openItrId).pipe(
      finalize(() => this.loading =false)
    ).subscribe(
      (snapshotResponse: any) => {
        this.processSnapshots(snapshotResponse['data']);
      },
      (snapshotError) => {
        console.error('Error fetching JV Snapshots', snapshotError);
        this.error = 'Error fetching JV Snapshots';
      }
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  processSnapshots(snapshots: any[]) {
    this.loading = true;
    setTimeout(() => {
      this.snapshots = snapshots.map(snapshot => ({
        version: snapshot.version,
        commitDate: this.formatDate(snapshot.commitMetadata.commitDate),
        fragmentName: snapshot.globalId.fragment,
        state: snapshot.state,
        id: snapshot.id,
        selected: false
      }));
      console.log('Processed Snapshots:', this.snapshots);
      this.loading = false;
    }, 0);
  }

   toggleSelection(snapshot: SnapshotItem) {
    snapshot.selected = !snapshot.selected;
    this.onSelectionChange();
  }

  onSelectionChange() {
    this.selectedItems = this.snapshots
      .filter(item => item.selected)
      .map(item => item.id);
  }

  callPutApi() {
    this.loading = true;
    this.utilService.getFilerIdByMobile(this.mobileNumber).pipe(
      finalize(() => console.log())
    ).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('api response', response);

        if (response && response.data && response.data.content && response.data.content.length > 0) {
          const openItrId = response.data.content[0].openItrId;


          if (openItrId) {
            this.loading = true;
            this.itrMs.putJvSnapshots(this.selectedItems, openItrId).pipe(
              finalize(() => this.loading = false)
            ).subscribe(
              (response) => {
                console.log('Put API response:', response);


                const dialogRef = this.dialog.open(PopUpComponent, {
                  width: '80%',
                  data: { response: response }
                });

                dialogRef.afterClosed().subscribe(result => {
                  if (result === true) {
                    console.log('Response saved to DB');

                  } else {
                   
                    console.log('User choose not to save or an error occurred');

                  }
                });
              },
              (error) => {
                console.error('Error calling Put API:', error);
                this.openResponsePopup(error);
              }

            );
          }
        }
      }
    );
  }
  
  getStateEntries(state: any): { key: string, value: any }[] {
    if (!state || typeof state !== 'object') {
      return [];
    }
    return Object.entries(state).map(([key, value]) => ({
      key,
      value: this.formatValue(value)
    }));
  }

  private formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `[${value.map(v => this.formatValue(v)).join(', ')}]`;
      }
      return JSON.stringify(value);
    }
    return String(value);
  }

  openResponsePopup(response: any) {
    this.dialog.open(PopUpComponent, {
      width: '80%',
      maxWidth: '1000px',
      data: response.data
    });
  }

}

