/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */

export const environment = {
	production: true,
	url: "https://api.taxbuddy.com",
	gst_gov_url: "https://devapi.gst.gov.in",
	ifsc_url: "https://ifsc.razorpay.com",
	s3_cred: {
		// user_name: "ashish@ssbainnovations.com",
		// password: "testPwd8761$",
		bucket: 'tb-gst-docs-dev',
		region: 'ap-south-1'
	},
	/* aws_cred: {
		identityPoolId: 'ap-south-1:441cb3f2-c1a9-4ca1-8964-ea56f5184aea',
		region: 'ap-south-1',
		userPoolId: 'ap-south-1_s42HgYzaY',
		userPoolWebClientId: '289f0frh4oj9rp5rh6q9opo4qn',
	}, */
	AMPLIFY_CONFIG: {
		aws_project_region: 'ap-south-1',
		aws_cognito_identity_pool_id: 'ap-south-1:441cb3f2-c1a9-4ca1-8964-ea56f5184aea',
		aws_cognito_region: 'ap-south-1',
		aws_user_pools_id: 'ap-south-1_s42HgYzaY',
		aws_user_pools_web_client_id: '289f0frh4oj9rp5rh6q9opo4qn',
		oauth: {},
		federationTarget: 'COGNITO_IDENTITY_POOLS',
		authenticationFlowType: 'USER_PASSWORD_AUTH'
	},
	botIds: ["brij@ssbainnovations.com", "divya@ssbainnovations.com", "urmila@ssbainnovations.com", "divya-gnmuk", "brij-s5ilq",
		"urmila-ij068", "sample-g7mh4", "taxbuddycustombot-68rl5", "welcome-c65qi"],

	agentId: [
		{ value: 'brij@ssbainnovations.com', label: 'Brij' },
		{ value: 'divya@ssbainnovations.com', label: 'Divya' },
		{ value: 'urmila@ssbainnovations.com', label: 'Urmila' },
		{ value: 'kavita@ssbainnovations.com', label: 'Kavita' },
		{ value: 'amrita@ssbainnovations.com', label: 'Amrita' },
		{ value: 'ankita@ssbainnovations.com', label: 'Ankita' },
		{ value: 'roshan.kakade@taxbuddy.com', label: 'Roshan' },
		{ value: 'damini@ssbainnovations.com', label: 'Damini' },
		{ value: 'supriya.mahindrakar@taxbuddy.com', label: 'Supriya' },
		{ value: 'aditya.singh@taxbuddy.com', label: 'Aditya' }
	]
};
