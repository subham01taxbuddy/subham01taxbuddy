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
	/* botIds: ["brij@ssbainnovations.com", "divya@ssbainnovations.com", "urmila@ssbainnovations.com", "divya-gnmuk", "brij-s5ilq",
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
	] */
};
