export const environment = {
	production: false,
	portal_url: 'http://localhost:5400',
	url: "https://uat-api.taxbuddy.com",
	gst_gov_url: "https://devapi.gst.gov.in",
	ifsc_url: "https://ifsc.razorpay.com",
	matomoScriptId: '1',
	s3_cred: {
		// user_name: "ashish@ssbainnovations.com",
		// password: "testPwd8761$",
		bucket: 'tb-gst-docs-uat-dev',
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
		aws_cognito_identity_pool_id: 'ap-south-1:f7280802-a172-4b2a-a3b2-adf642b67b38',
		aws_cognito_region: 'ap-south-1',
		aws_user_pools_id: 'ap-south-1_7GHESh9rb',
		aws_user_pools_web_client_id: 'pdtpeogn8a2viimond1u0debi',
		oauth: {},
		federationTarget: 'COGNITO_IDENTITY_POOLS',
		authenticationFlowType: 'USER_PASSWORD_AUTH'
	},
};
