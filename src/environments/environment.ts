export const environment = {
  production: true,
  url_dev: 'https://dev-api.taxbuddy.com',
  portal_url: 'https://gst-admin.taxbuddy.com/',
  url: 'https://api.taxbuddy.com',
  eri_url: 'https://api.taxbuddy.com',
  gst_gov_url: 'https://devapi.gst.gov.in',
  ifsc_url: 'https://ifsc.razorpay.com',
  amazonaws_url: 'https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com',
  reviewUrl: 'https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/',
  isValidItr: true,
  assistedKmScript: '../assets/assisted-km-script-uat.html',
  environment: 'PROD',
  admin_id: 1067,
  webportal_url: 'https://itr.taxbuddy.com',
  lifecycleUrl:
    'https://ngd74g554pp72qp5ur3b55cvia0vfwur.lambda-url.ap-south-1.on.aws/itr/lifecycle-status',
  lifecycleEnv: 'prod',

  gdrive: {
    GOOGLE_DRIVE_CLIENT_ID:
      '994281120398-930gtuaop72na800aqf6f38uqjc77mvq.apps.googleusercontent.com',
    GOOGLE_DRIVE_CLIENT_SECRET: 'GOCSPX - zn5Minf3MdzYRk_PchAdair9MWSn',
    GOOGLE_DRIVE_REDIRECT_URI: 'https://developers.google.com/oauthplayground',
    // GOOGLE_DRIVE_API_KEY : 'AIzaSyDbc9tRF_zEqgITEen8BAIpbFeWF5i-w90',
    GOOGLE_DRIVE_API_KEY: 'AIzaSyDbc9tRF_zEqgITEen8BAIpbFeWF5i-w90',
    // GOOGLE_DRIVE_REFRESH_TOKEN : '1//04pkPTYbdma87CgYIARAAGAQSNwF-L9IrPQ3eZitgESUDwy99aGnxQxLEXLjZy0hJ2oVY0U6jyzt-G1-QwfmgQhP2-5B07tGiWGA'
    FOLDER_ID: '15MjvRj7e18aqvkQUrFnEFAKSohUdVQBr',
  },

  s3_cred: {
    // user_name: "ashish@ssbainnovations.com",
    // password: "testPwd8761$",
    bucket: 'tb-gst-docs-dev',
    region: 'ap-south-1',
  },
  /* aws_cred: {
		identityPoolId: 'ap-south-1:441cb3f2-c1a9-4ca1-8964-ea56f5184aea',
		region: 'ap-south-1',
		userPoolId: 'ap-south-1_s42HgYzaY',
		userPoolWebClientId: '289f0frh4oj9rp5rh6q9opo4qn',
	}, */
  AMPLIFY_CONFIG: {
    aws_project_region: 'ap-south-1',
    aws_cognito_identity_pool_id:
      'ap-south-1:441cb3f2-c1a9-4ca1-8964-ea56f5184aea',
    aws_cognito_region: 'ap-south-1',
    aws_user_pools_id: 'ap-south-1_s42HgYzaY',
    aws_user_pools_web_client_id: '289f0frh4oj9rp5rh6q9opo4qn',
    oauth: {},
    federationTarget: 'COGNITO_IDENTITY_POOLS',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },

  externalScripts: {},
  firebaseConfig: {
    apiKey: 'AIzaSyCTINXADOkr4isp-GJXu5IjV8kPlqb7OZo',
    authDomain: 'taxbuddy-29fe2.firebaseapp.com',
    databaseURL: 'https://taxbuddy-29fe2.firebaseio.com',
    projectId: 'taxbuddy-29fe2',
    storageBucket: 'taxbuddy-29fe2.appspot.com',
    messagingSenderId: '294419985055',
    appId: '1:294419985055:web:ba4a7ae5511923269d28aa',
    measurementId: 'G-ED3KSXPPS8',
  },
};
