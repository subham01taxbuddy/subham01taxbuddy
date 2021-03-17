import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { UserMsService } from 'app/services/user-ms.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-filing-status-table',
  templateUrl: './filing-status-table.component.html',
  styleUrls: ['./filing-status-table.component.css']
})
export class FilingStatusTableComponent implements OnInit {
  @Input('statusId') statusId: any;
  docUploadedList = [];
  page = 0; // current page
  count = 0; // total pages
  pageSize = 20; // number of items in each page
  agentId = '';
  agentList = [
    { value: 'roshan.kakade@taxbuddy.com', label: 'Roshan' },
    { value: 'damini@ssbainnovations.com', label: 'Damini' },
    { value: 'supriya.mahindrakar@taxbuddy.com', label: 'Supriya' },
    { value: 'aditya.singh@taxbuddy.com', label: 'Aditya' },
    { value: 'ankita@ssbainnovations.com', label: 'Ankita' },
    { value: 'amrita@ssbainnovations.com', label: 'Amrita' },
    { value: 'kavita@ssbainnovations.com', label: 'Kavita' },
    { value: 'urmila@ssbainnovations.com', label: 'Urmila' },
    { value: 'divya@ssbainnovations.com', label: 'Divya' },
    { value: 'brij@ssbainnovations.com', label: 'Brij' },
  ];
  filingTeamMembers = [
    { value: 1063, label: 'Amrita Thakur' },
    { value: 1064, label: 'Ankita Murkute' },
    { value: 1062, label: 'Damini Patil' },
    { value: 1707, label: 'Kavita Singh' },
    { value: 1706, label: 'Nimisha Panda' },
    { value: 24346, label: 'Tushar Shilimkar' },
    { value: 19529, label: 'Kirti Gorad' },
    { value: 24348, label: 'Geetanjali Panchal' },
    { value: 23553, label: 'Renuka Kalekar' },
    { value: 23550, label: 'Bhavana Patil' },
    { value: 23567, label: 'Sneha Suresh Utekar' },
    { value: 23552, label: 'Roshan Vilas Kakade' },
    { value: 23551, label: 'Pradnya Tambade' },
    { value: 983, label: 'Usha Chellani' },
    { value: 23670, label: 'Ashwini Kapale' },
    { value: 23578, label: 'Aditi Ravindra Gujar' },
    // { value: 23564, label: 'Sonali Ghanwat' }, Quit
    { value: 23668, label: 'Chaitanya Prakash Masurkar' },


    { value: 25942, label: 'Vaibhav M. Nilkanth' },
    { value: 26220, label: 'Pratiksha Shivaji Jagtap' },
    { value: 177, label: 'Aditya U.Singh' },
    { value: 26195, label: 'Tejaswi Suraj Bodke' },
    { value: 23505, label: 'Tejshri Hanumant Bansode' },
    { value: 26215, label: 'Deepali Nivrutti Pachangane' },
    // { value: 26217, label: 'Manasi Jadhav' }, Quit
    { value: 26236, label: 'Supriya Mahindrakar' },
    // { value: 26218, label: 'Mrudula Vishvas Shivalkar' }, Quit
    // { value: 26235, label: 'Chaitrali Ranalkar' },

    { value: 28033, label: 'Shrikanth Elegeti' },
    // { value: 28032, label: 'Pranali Patil' },
    { value: 28040, label: 'Namrata Shringarpure' },
    { value: 28035, label: 'Rupali Onamshetty' },
    { value: 27474, label: 'Poonam Hase' },
    { value: 28044, label: 'Bhakti Khatavkar' },
    { value: 28034, label: 'Dipali Waghmode' },
    { value: 28031, label: 'Harsha Kashyap' },
    { value: 28222, label: 'Ankita Pawar' },
    { value: 28763, label: 'Smita Yadav' },

    { value: 42886, label: 'Gitanjali Kakade' },
    { value: 42885, label: 'Dhanashri wadekar' },
    { value: 42888, label: 'Baby Kumari Yadav' },
    { value: 43406, label: 'Priyanka Shilimkar' },
    { value: 42878, label: 'Supriya Waghmare' },
    { value: 42931, label: 'Dhanashree Amarale' },
    { value: 67523, label: 'Supriya Kumbhar' },
    { value: 67522, label: 'Nikita Chilveri' },
    { value: 67558, label: 'Sunita Sharma' },
    { value: 71150, label: 'Deep Trivedi', },
    { value: 71148, label: 'Riddhi Solanki', },
    { value: 71159, label: 'Ajay Kandhway' },
    { value: 71168, label: 'Ganesh Jaiswal' },
    { value: 75925, label: 'Nikita Shah' },
    { value: 81402, label: 'Vatsa Bhanushali' },
    { value: 87321, label: 'Chetan Kori' },

    { value: 1065, label: 'Urmila Warve' },
    { value: 1067, label: 'Divya Bhanushali' },
    { value: 21354, label: 'Brijmohan Lavaniya' },
  ];
  loading = false;
  constructor(private userMsService: UserMsService, public utilsService: UtilsService, private router: Router) { }

  ngOnInit() {
    console.log('selectedAgentId -> ', localStorage.getItem('selectedAgentId'));
    let agentId = localStorage.getItem('selectedAgentId');
    if (this.utilsService.isNonEmpty(agentId)) {
      this.agentId = agentId;
      this.retrieveDocUploaded(0);
    }
    else {
      this.retrieveDocUploaded(0);
    }
  }

  retrieveDocUploaded(page) {
    this.loading = true;
    const param = `/user-details-by-status-es?from=${page}&to=${this.pageSize}&agentId=${this.agentId}&statusId=${this.statusId}`;
    // /user-details-by-status-es?from=0&to=20&agentId=aditya.singh@taxbuddy.com&statusId=2
    this.userMsService.getMethod(param).subscribe((result: any) => {
      console.log('New User data', result);
      this.docUploadedList = result;
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }
  selectAgent(agentName) {
    this.agentId = agentName;
    localStorage.setItem('selectedAgentId', this.agentId);
    this.page = 0;
    this.retrieveDocUploaded(0);
  }
  previous() {
    this.page = this.page - this.pageSize;
    this.retrieveDocUploaded(this.page);
  }
  next() {
    this.page = this.page + this.pageSize;
    console.log('clicked on next:', this.page)
    this.retrieveDocUploaded(this.page);
  }

  getFilerName(itr) {
    if (this.utilsService.isNonEmpty(itr) && this.utilsService.isNonEmpty(itr['FilingTeamMemberId']) && itr['FilingTeamMemberId'] !== 0) {
      const filer = this.filingTeamMembers.filter(item => item.value === itr['FilingTeamMemberId']);
      if (filer.length > 0) {
        return filer[0].label;
      }
      return 'SME Not Found'
    }
    return 'Not Assigned';
  }

  startFiling(data) {
    this.loading = true;
    const param = `/profile/${data['userId']}`
    this.userMsService.getMethod(param).subscribe((result: any) => {
      this.utilsService.getITRByUserIdAndAssesmentYear(result);
    }, error => {
      this.loading = true;
      this.utilsService.showSnackBar('Some data points are missing please dont try from here')
    })
  }
  goToKommunicate(data) {
    if (this.utilsService.isNonEmpty(data['KommunicateURL'])) {
      window.open(data['KommunicateURL'], '_blank')
    }
  }
  routeAction(data) {
    if (this.statusId == 11) {
      console.log('user data : ', data, data.sourceAsMap['userId'])
      sessionStorage.setItem('invoiceNotgeneratedUserId', data.sourceAsMap['userId']);  //sourceAsMap['Phone']s //TODO removed relevent code from subscription module
      this.router.navigate(['/pages/invoice/generate']);
    } else if (this.statusId == 12) {
      this.router.navigate(['/pages/invoice/list']);
    }
  }
}

