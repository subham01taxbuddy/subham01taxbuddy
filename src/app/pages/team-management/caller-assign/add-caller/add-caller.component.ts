import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ToastMessageService } from 'app/services/toast-message.service';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-add-caller',
  templateUrl: './add-caller.component.html',
  styleUrls: ['./add-caller.component.css']
})
export class AddCallerComponent implements OnInit {
  loading: boolean;
  addCallerGridOptions: GridOptions;
  callerData: any = [];
  selectedCallerList: any = [];
  removeCallerList: any = [];

  constructor(private userMsService: UserMsService, private utileService: UtilsService, private toastMsgService: ToastMessageService) { 
    this.addCallerGridOptions = <GridOptions>{
      rowData: [],
      columnDefs: this.callersColoumnDef(),
      enableCellChangeFlash: true,
      onGridReady: params => {
      },

      sortable: true,
    };
  }

  ngOnInit() {
    this.getCallerUser()
  }

  callersColoumnDef(){
    return [
        {
          headerName: 'Sme Id',
          field: 'smeId',
          width: 100,
          suppressMovable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agTextColumnFilter",
          filterParams: {
            filterOptions: ["contains", "notContains"],
            debounceMs: 0
          }
        },
        {
          headerName: 'Name',
          field: 'name',
          width: 180,
          suppressMovable: true,
          cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
          filter: "agTextColumnFilter",
          filterParams: {
            filterOptions: ["contains", "notContains"],
            debounceMs: 0
          }
        },
        {
          headerName: 'Mobile',
          field: 'mobileNumber',
          width: 140,
          suppressMovable: true,
          filter: "agTextColumnFilter",
          filterParams: {
            filterOptions: ["contains", "notContains"],
            debounceMs: 0
          }
        },   
        {
          headerName: 'Email',
          field: 'email',
          width: 280,
          suppressMovable: true,
          cellStyle: { textAlign: 'center' },
          filter: "agTextColumnFilter",
          filterParams: {
            filterOptions: ["contains", "notContains"],
            debounceMs: 0
          }
        },
        {
          headerName: 'Service Type',
          field: 'serviceType',
          width: 150,
          suppressMovable: true,
          cellStyle: { textAlign: 'center', 'fint-weight': 'bold' },
          filter: "agTextColumnFilter",
          filterParams: {
            filterOptions: ["contains", "notContains"],
            debounceMs: 0
          }
        },
        
        { 
          headerName: 'Add Caller',
          editable: false,
          suppressMenu: true,
          sortable: true,
          suppressMovable: true,
          cellRenderer: function (params) {
            console.log(params)
            return `<input type="checkbox" [(ngModel)]="param.data.addCaller" (change)="checkValue(param)" />`;
          },
          width: 130,
          pinned: 'right',
          cellStyle: function (params) {
            return {
              textAlign: 'center', display: 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            }
          },
        }
    ]
  }

  getCallerUser(){
    this.loading = true;
    const userData = JSON.parse(localStorage.getItem('UMD'));
    let param = `/call-management/caller-agents-role?agentUserId=${userData.USER_UNIQUE_ID}`;
    this.userMsService.getMethod(param).subscribe(res=>{
        console.log('caller users: ',res);
        this.loading = false;
        if(Array.isArray(res) && res.length > 0){
          this.callerData = res;
          this.selectedCallerList = [];
          this.removeCallerList = [];
          // this.addCallerGridOptions.api.setRowData(this.createRowData(res));
        }
    },
    error=>{
         console.log('Error during getting caller users daa: ',error);
         this.loading = false;
    })
  }

  createRowData(callerData){
    console.log('callerData -> ', callerData);
    var callerArray = [];
    for (let i = 0; i < callerData.length; i++) {
      let couponInfo = Object.assign({}, callerArray[i], {
        smeId: callerData[i].smeId,
        name: this.utileService.isNonEmpty(callerData[i].name) ? callerData[i].name : '-',
        mobileNumber: this.utileService.isNonEmpty(callerData[i].mobileNumber) ? callerData[i].mobileNumber : '-',
        email: this.utileService.isNonEmpty(callerData[i].email) ? callerData[i].email : '-',
        serviceType: this.utileService.isNonEmpty(callerData[i].serviceType) ? callerData[i].serviceType : '-',
        agentId: this.utileService.isNonEmpty(callerData[i].agentId) ? callerData[i].agentId : '-',
        addCaller: false
      })
      callerArray.push(couponInfo);
    }
    console.log('callerArray-> ', callerArray)
    return callerArray;
  }

  addCaller(event, userId){
    if(event.currentTarget.checked){
      this.selectedCallerList.push(userId)
    }
    else{
      this.selectedCallerList = this.selectedCallerList.filter(item => item != userId);
    }
    console.log('final selectedCallerList: -> ',this.selectedCallerList)
  }

  removeCaller(event, userId){
    if(event.currentTarget.checked){
      this.removeCallerList.push(userId)
    }
    else{
      this.removeCallerList = this.removeCallerList.filter(item => item != userId);
    }
    console.log('final removeCallerList: -> ',this.removeCallerList)
  }

  saveCaller(action){
    this.loading = true;
    const userData = JSON.parse(localStorage.getItem('UMD'));
    var caller;
    if(action === 'add'){  
      caller = this.getCalletList(action)
      var param  = `/call-management/caller-agents?agentUserId=${userData.USER_UNIQUE_ID}&addCallerAgents=${caller}&removeCallerAgent=`;
    }
    else{
      caller = this.getCalletList(action)
      var param  = `/call-management/caller-agents?agentUserId=${userData.USER_UNIQUE_ID}&addCallerAgents=&removeCallerAgent=${caller}`;
    }
     console.log('caller -> ',caller)
     console.log('param: ',param)
     this.userMsService.putMethod(param).subscribe(res=>{
        console.log('add: -> ',res)
        this.loading = false;
        this.toastMsgService.alert('success', 'Caller data update succesfully.');
        this.getCallerUser();
     },
     error=>{
       console.log('error during add callers: -> ',error);
        this.loading = false;
        this.toastMsgService.alert('error', 'There is some to update data.')
     })
    }

    getCalletList(action){
      var callerList;
      if(action === 'add'){
        if(this.selectedCallerList.length === 1){
          callerList = this.selectedCallerList[0];
        }
        else if(this.selectedCallerList.length > 1){
          for(let i=0; i<this.selectedCallerList.length; i++){
            if(i === 0){
              callerList = this.selectedCallerList[i];
            }
            else{
             callerList = callerList+','+this.selectedCallerList[i];
            }
          }
        }
        return callerList;
      }
      else{
        if(this.removeCallerList.length === 1){
          callerList = this.removeCallerList[0];
        }
        else if(this.removeCallerList.length > 1){
          for(let i=0; i<this.removeCallerList.length; i++){
            if(i === 0){
              callerList = this.removeCallerList[i];
            }
            else{
             callerList = callerList+','+this.removeCallerList[i];
            }
          }
        }
        return callerList;
      }
      
    }

  }
