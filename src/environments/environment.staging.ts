export const environment = {
	production: false,
	url_dev: "https://dev-api.taxbuddy.com",
	portal_url: 'https://uat-admin.taxbuddy.com/',
	url: "https://uat-api.taxbuddy.com",
	eri_url: "https://api.taxbuddy.com",
	gst_gov_url: "https://devapi.gst.gov.in",
	ifsc_url: "https://ifsc.razorpay.com",
	amazonaws_url: "https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com",
	reviewUrl: "https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/",
	addClientThroughEportal: "https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/efiling/add-eri",
	isValidItr: false,
	environment: 'UAT',
	kmAppId: "3f4d0cc30b95c4deb37639d7cc350c728",
	admin_id: 3000,
	allowReassignToPreviousLeader: [3000,14140],
	webportal_url: 'https://uat-itr.taxbuddy.com',
	lifecycleUrl: "https://ngd74g554pp72qp5ur3b55cvia0vfwur.lambda-url.ap-south-1.on.aws/itr/lifecycle-status",
	lifecycleEnv: "qa",
	payOutEnv: "QA",
	validate_km_token: "https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/kommunicate/validate-token",
	idleTimeMins: 30,
	ITR_LIFECYCLE: "https://e2gqddb7dcvllacrbnpqjnc53a0oetmd.lambda-url.ap-south-1.on.aws",
	upload_file: 'https://z6sphosqllkzc7ty53ygn7scqa0vnbtf.lambda-url.ap-south-1.on.aws/',
	check_upload: 'https://rskq6saw7ymmdgm3cloc4dcenm0ywqix.lambda-url.ap-south-1.on.aws/',
	download_file: 'https://avamuzavbieadujrkme44yfetq0cxiou.lambda-url.ap-south-1.on.aws/',
	update_id: 'https://7nlo6vqc673gcqlt7dx5byvgo40qcfeg.lambda-url.ap-south-1.on.aws/',
	get_adjustment: 'https://k42t7a34l7qzlxodv3c6hbj5om0cbvac.lambda-url.ap-south-1.on.aws/',
	add_adjustment: 'https://2hifgwy53ui62fbhnucv77mjdq0rcslo.lambda-url.ap-south-1.on.aws/',
	get_tds: 'https://cihbintebntput6bydyqnksj2a0zykgg.lambda-url.ap-south-1.on.aws/',
	adjustment: 'https://ufkz5k66goajzposopzqdn5ciq0bimle.lambda-url.ap-south-1.on.aws/',
	get_adjustment_csv: 'https://oejtteophnvpnunmyzoioyksgi0kixmh.lambda-url.ap-south-1.on.aws/',

	gdrive: {
		GOOGLE_DRIVE_CLIENT_ID: '994281120398-930gtuaop72na800aqf6f38uqjc77mvq.apps.googleusercontent.com',
		GOOGLE_DRIVE_CLIENT_SECRET: 'GOCSPX - zn5Minf3MdzYRk_PchAdair9MWSn',
		GOOGLE_DRIVE_REDIRECT_URI: 'https://developers.google.com/oauthplayground',
		// GOOGLE_DRIVE_API_KEY : 'AIzaSyDbc9tRF_zEqgITEen8BAIpbFeWF5i-w90',
		GOOGLE_DRIVE_API_KEY: 'AIzaSyDbc9tRF_zEqgITEen8BAIpbFeWF5i-w90',
		// GOOGLE_DRIVE_REFRESH_TOKEN : '1//04pkPTYbdma87CgYIARAAGAQSNwF-L9IrPQ3eZitgESUDwy99aGnxQxLEXLjZy0hJ2oVY0U6jyzt-G1-QwfmgQhP2-5B07tGiWGA'
		FOLDER_ID: '1DlJN6xgPyrX_ijF7k6q4M_1rwiRFJkGt'
	},

	// firebaseConfig: {
	// 	apiKey: "AIzaSyCJ2slZlHWDCsZLJs59NGU-lTAHOfucZyk",
	// 	authDomain: "taxbuddy-uat.firebaseapp.com",
	// 	databaseURL: "https://taxbuddy-uat.firebaseio.com",
	// 	projectId: "taxbuddy-uat",
	// 	storageBucket: "taxbuddy-uat.appspot.com",
	// 	messagingSenderId: "805239680508",
	// 	appId: "1:805239680508:web:b9258ec04023b0fda05679",
	// 	measurementId: "G-DMWVKK98X2"
	// },
	firebaseConfig: {
		apiKey: "AIzaSyCJ2slZlHWDCsZLJs59NGU-lTAHOfucZyk",
		authDomain: "taxbuddy-uat.firebaseapp.com",
		databaseURL: "https://taxbuddy-uat.firebaseio.com",
		projectId: "taxbuddy-uat",
		storageBucket: "taxbuddy-uat.appspot.com",
		messagingSenderId: "805239680508",
		appId: "1:805239680508:web:c5a224dafd6a97bea05679",
		measurementId: "G-R5JYTLSE8B"
	},

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

	WEBSOCKET_URL: 'wss://uat-tiledesk.taxbuddy.com/mqws/ws',
	CHAT_API_URL: 'https://uat-tiledesk.taxbuddy.com/chatapi/api/tilechat',
	TILEDESK_URL: 'https://uat-tiledesk.taxbuddy.com',
	USER_STATUS_WEBSOCKET_URL: 'wss://uat-tiledesk.taxbuddy.com/ws',
	PROJECT_NAME: 'Taxbuddy UAT',
	TILEDESK_PROJECT_ID: "6717588e19e2ea0012a84b47"
};
