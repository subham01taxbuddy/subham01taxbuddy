import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team-subscriptions',
  templateUrl: './team-subscriptions.component.html',
  styleUrls: ['./team-subscriptions.component.css']
})
export class TeamSubscriptionsComponent implements OnInit {
  queryParam = '';
  teamMember: any
  filingTeamMembers = [
    { teamLeadId: 1063, value: 1063, label: 'Amrita Thakur' },
    { teamLeadId: 1064, value: 1064, label: 'Ankita Murkute' },
    { teamLeadId: 1062, value: 1062, label: 'Damini Patil' },
    { teamLeadId: 1707, value: 1707, label: 'Kavita Singh' },
    { teamLeadId: 1706, value: 1706, label: 'Nimisha Panda' },
    { teamLeadId: 1063, value: 24346, label: 'Tushar Shilimkar' },
    { teamLeadId: 1062, value: 19529, label: 'Kirti Gorad' },
    { teamLeadId: 1062, value: 24348, label: 'Geetanjali Panchal' },
    { teamLeadId: 1065, value: 23553, label: 'Renuka Kalekar' },
    { teamLeadId: 1064, value: 23550, label: 'Bhavana Patil' },
    { teamLeadId: 1063, value: 23567, label: 'Sneha Suresh Utekar' },
    { teamLeadId: 1063, value: 23552, label: 'Roshan Vilas Kakade' },
    { teamLeadId: 1063, value: 23551, label: 'Pradnya Tambade' },
    { teamLeadId: 1063, value: 983, label: 'Usha Chellani' },
    { teamLeadId: 1065, value: 23670, label: 'Ashwini Kapale' },
    { teamLeadId: 1065, value: 23578, label: 'Aditi Ravindra Gujar' },
    { teamLeadId: 1062, value: 23668, label: 'Chaitanya Prakash Masurkar' },

    { teamLeadId: 1063, value: 25942, label: 'Vaibhav M. Nilkanth' },
    { teamLeadId: 1064, value: 26220, label: 'Pratiksha Shivaji Jagtap' },
    { teamLeadId: 1062, value: 177, label: 'Aditya U.Singh' },
    { teamLeadId: 1706, value: 26195, label: 'Tejaswi Suraj Bodke' },
    { teamLeadId: 1064, value: 23505, label: 'Tejshri Hanumant Bansode' },
    { teamLeadId: 1063, value: 26215, label: 'Deepali Nivrutti Pachangane' },
    // { teamLeadId: 1065, value: 26217, label: 'Manasi Jadhav' },
    { teamLeadId: 1065, value: 26236, label: 'Supriya Mahindrakar' },
    // { teamLeadId: 1065, value: 26218, label: 'Mrudula Vishvas Shivalkar' },
    // { teamLeadId: 1062, value: 26235, label: 'Chaitrali Ranalkar' },

    { teamLeadId: 1064, value: 28033, label: 'Shrikanth Elegeti' },
    // { teamLeadId: 1064, value: 28032, label: 'Pranali Patil' },
    { teamLeadId: 1064, value: 28040, label: 'Namrata Shringarpure' },
    { teamLeadId: 1064, value: 28035, label: 'Rupali Onamshetty' },
    // { teamLeadId: 1064, value: 27474, label: 'Poonam Hase' },
    { teamLeadId: 1064, value: 28044, label: 'Bhakti Khatavkar' },
    { teamLeadId: 1064, value: 28034, label: 'Dipali Waghmode' },
    { teamLeadId: 1064, value: 28031, label: 'Harsha Kashyap' },
    // { teamLeadId: 1064, value: 28222, label: 'Ankita Pawar' },
    // { teamLeadId: 1706, value: 28763, label: 'Smita Yadav' },

    { teamLeadId: 0, value: 42886, label: 'Gitanjali Kakade' },
    { teamLeadId: 0, value: 42885, label: 'Dhanashri wadekar' },
    { teamLeadId: 0, value: 42888, label: 'Baby Kumari Yadav' },
    { teamLeadId: 0, value: 43406, label: 'Priyanka Shilimkar' },
    { teamLeadId: 0, value: 42878, label: 'Supriya Waghmare' },
    { teamLeadId: 0, value: 42931, label: 'Dhanashree Amarale' },
    { teamLeadId: 1063, value: 67523, label: 'Supriya Kumbhar' },
    { teamLeadId: 1063, value: 67522, label: 'Nikita Chilveri' },
    { teamLeadId: 1063, value: 67558, label: 'Sunita Sharma' },
    { teamLeadId: 1063, value: 71150, label: 'Deep Trivedi', },
    { teamLeadId: 1063, value: 71148, label: 'Riddhi Solanki', },
    { teamLeadId: 1063, value: 71159, label: 'Ajay Kandhway', },
    { teamLeadId: 1063, value: 71168, label: 'Ganesh Jaiswal', },
    { teamLeadId: 1707, value: 75925, label: 'Nikita Shah', },
    { teamLeadId: 1707, value: 81402, label: 'Vatsa Bhanushali' },
    { teamLeadId: 1064, value: 87321, label: 'Chetan Kori' },

    { teamLeadId: 0, value: 1065, label: 'Urmila Warve' },
    { teamLeadId: 0, value: 1067, label: 'Divya Bhanushali' },
    { teamLeadId: 0, value: 21354, label: 'Brijmohan Lavaniya' },
  ];

  constructor() { }

  ngOnInit() {

  }

  getMembersSubscriptions(member) {
    this.teamMember = member;
    this.queryParam = `?subscriptionAssigneeId=${member.value}`;
  }

}
