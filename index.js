// initialize core so unbundling has setTimeout defined
import 'react-native/Libraries/Core/InitializeCore';
import 'es6-shim';

import {DeviceEventEmitter} from 'react-native';
//import {DeviceEventEmitter, Platform} from 'react-native';
// import {NativeEventsReceiver, Navigation} from 'react-native-navigation';

// import configureStore from 'app/store';
// import initialState from 'app/initial_state';

// import App from './App';
import telemetry from './telemetry';
import Mattermost from 'app/mattermost';

telemetry.captureStart('mattermostInitiliaze');

const jsBundleMetrics = 'JS_BUNDLE_METRICS';
const metricsSubscription = DeviceEventEmitter.addListener(jsBundleMetrics, (metrics) => {
    telemetry.capture('jsBundleRun', metrics.jsBundleRunStartTime, metrics.jsBundleRunEndTime);
    DeviceEventEmitter.removeSubscription(metricsSubscription);
    // telemetry.sendMetrics();
});

// telemetry.captureStart('StoreHydration');
// const store = configureStore(initialState);
// const unsubscribeFromStore = store.subscribe(listenForHydration);
//
// function listenForHydration() {
//     const {dispatch, getState} = store;
//     const state = getState();
//     // if (!this.isConfigured) {
//         // this.configurePushNotifications();
//     // }
//
//     if (state.views.root.hydrationComplete) {
//         telemetry.captureEnd('StoreHydration');
//         console.log('hydration complete');
//         unsubscribeFromStore();
//         start();
//     }
// };
//
// const launchApp = () => {
//     Navigation.startSingleScreenApp({
//         screen: {
//             screen: 'App',
//             navigatorStyle: {
//                 navBarHidden: true,
//                 statusBarHidden: false,
//                 statusBarHideWithNavBar: false,
//                 screenBackgroundColor: 'transparent',
//             },
//         },
//         passProps: {
//             allowOtherServers: true,
//         },
//         appStyle: {
//             orientation: 'auto',
//         },
//         animationType: 'fade',
//     });
//     telemetry.captureEnd('mattermostInitiliaze');
// }
//
// const start = () => {
//     if (Platform.OS === 'android') {
//         // In case of Android we need to handle the bridge being initialized by HeadlessJS
//         Promise.resolve(Navigation.isAppLaunched()).then((appLaunched) => {
//             if (appLaunched) {
//                 console.log('Launching app');
//                 launchApp(); // App is launched -> show UI
//             } else {
//                 console.log('Launching deferred app');
//                 new NativeEventsReceiver().appLaunched(launchApp); // App hasn't been launched yet -> show the UI only when needed.
//             }
//         });
//     } else {
//         launchApp();
//     }
// }

if (__DEV__) {
    const modules = require.getModules();
    const moduleIds = Object.keys(modules);
    const loadedModuleNames = moduleIds
    .filter(moduleId => modules[moduleId].isInitialized)
    .map(moduleId => modules[moduleId].verboseName);
    const waitingModuleNames = moduleIds
    .filter(moduleId => !modules[moduleId].isInitialized)
    .map(moduleId => modules[moduleId].verboseName);

// make sure that the modules you expect to be waiting are actually waiting
    console.log(
        'loaded:',
        loadedModuleNames,
        'waiting:',
        waitingModuleNames
    );

// grab this text blob, and put it in a file named packager/moduleNames.js
    console.log(`module.exports = ${JSON.stringify(loadedModuleNames.sort())};`);
}

// new Mattermost();
