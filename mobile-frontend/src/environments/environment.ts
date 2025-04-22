// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiEndpoint: 'http://127.0.0.1:3000/',
  frontAPPEndpoint: 'http://103.233.79.87:8017/',
  defaultauth: 'fakebackend',
  firebaseConfig: {
    // apiKey: "",
    // authDomain: "",
    // databaseURL: "",
    // projectId: "",
    // storageBucket: "",
    // messagingSenderId: "",
    // appId: "",
    // measurementId: ""
    apiKey: "AIzaSyDPdgXPQP2jvJPH2EGQdT_u-LX3uGSKC_8",
    authDomain: "testpayops-c06b3.firebaseapp.com",
    projectId: "testpayops-c06b3",
    messagingSenderId: "676197848344",
    appId: "1:676197848344:web:a1ab51128950fb32a6fa6d",
    vapidKey: "BEvoR4oltGZxEnawrYHSC3fdUSnGld3hi1rwOnuoVtQkjE9RummFlxKe8NrBz0tbDUnOoQPlTuc1BWSsnPporJg"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
