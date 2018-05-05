// initialize core so unbundling has setTimeout defined
import 'react-native/Libraries/Core/InitializeCore';

import {DeviceEventEmitter} from 'react-native';

import telemetry from './telemetry';
import Mattermost from 'app/entry';

const jsBundleMetrics = 'JS_BUNDLE_METRICS';
const metricsSubscription = DeviceEventEmitter.addListener(jsBundleMetrics, (metrics) => {
    telemetry.capture('jsBundleRun', metrics.jsBundleRunStartTime, metrics.jsBundleRunEndTime);
    DeviceEventEmitter.removeSubscription(metricsSubscription);
});

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

new Mattermost();