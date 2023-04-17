export const environment = {
  production: true,
  url_dev:"https://dev-api.taxbuddy.com",
  portal_url: 'https://gst-admin.taxbuddy.com/',
  url: "https://api.taxbuddy.com",
  eri_url: "https://api.taxbuddy.com",
  gst_gov_url: "https://devapi.gst.gov.in",
  ifsc_url: "https://ifsc.razorpay.com",
  amazonaws_url: "https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com",
  reviewUrl: "https://9buh2b9cgl.execute-api.ap-south-1.amazonaws.com/prod/",
  isValidItr:true,
  assistedKmScript: '../assets/assisted-km-script-uat.html',
  environment:'PROD',


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

  externalScripts: {
  }
};
