// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Provider} from 'react-redux';
import {AppState, Platform} from 'react-native';
import {Navigation, NativeEventsReceiver} from 'react-native-navigation';

import {setSystemEmojis} from 'mattermost-redux/actions/emojis';
import {loadMe} from 'mattermost-redux/actions/users';
import {Client4} from 'mattermost-redux/client';

import initialState from 'app/initial_state';
import Emm from 'app/initialize/emm';
import PushNotification from 'app/initialize/push_notifications';
import configureStore from 'app/store';
import {registerScreens} from 'app/screens';

import telemetry from '../telemetry';

export default class EntryPoint {
    constructor() {
        telemetry.captureStart('hydration');
        this.store = configureStore(initialState);
        this.emm = new Emm(this.store, this.startFakeApp);
        this.push_notification = new PushNotification(this.store);

        const EventHandlers = require('app/initialize/event_handlers').default;
        this.events = new EventHandlers(
            this.store,
            this.emm,
            this.push_notification,
            this.launchApp,
            this.startApp,
        );

        telemetry.captureStart('registerScreens');
        registerScreens(this.store, Provider);
        telemetry.captureEnd('registerScreens');
        this.unsubscribeFromStore = this.store.subscribe(this.listenForHydration);

        const Emojis = require('app/utils/emojis');
        setSystemEmojis(Emojis.EmojiIndicesByAlias);
    }

    listenForHydration = () => {
        const {getState} = this.store;
        const state = getState();

        if (state.views.root.hydrationComplete) {
            telemetry.captureEnd('hydration');

            this.unsubscribeFromStore();
            console.log('PN token', state.entities.general.deviceToken);

            const notification = this.push_notification.getNotification();
            if (notification) {
                const {data, text, badge, completed} = notification;
                this.push_notification.onPushNotificationReply(data, text, badge, completed);
                this.push_notification.resetNotification();
            }

            const isNotActive = AppState.currentState !== 'active';
            if (Platform.OS === 'android') {
                // In case of Android we need to handle the bridge being initialized by HeadlessJS
                Promise.resolve(Navigation.isAppLaunched()).then((appLaunched) => {
                    if (appLaunched) {
                        this.launchApp(); // App is launched -> show UI
                    } else {
                        console.log('will launch app');
                        new NativeEventsReceiver().appLaunched(this.launchApp); // App hasn't been launched yet -> show the UI only when needed.
                    }
                });
            } else if (isNotActive) {
                // for IOS replying from push notification starts the app in the background
                this.events.setRelaunchWhenActive(true);
                this.startFakeApp(); // do I need this? TODO: test for iOS without this.
            } else {
                this.launchApp();
            }
        }
    };

    launchApp = () => {
        telemetry.captureStart('emmValidation');
        this.emm.handleManagedConfig().then((shouldStart) => {
            telemetry.captureEnd('emmValidation');
            if (shouldStart) {
                this.startApp('fade');
            }
        });
    };

    startFakeApp = async () => {
        return Navigation.startSingleScreenApp({
            screen: {
                screen: 'Root',
                navigatorStyle: {
                    navBarHidden: true,
                    statusBarHidden: false,
                    statusBarHideWithNavBar: false,
                },
            },
        });
    };

    startApp = (animationType = 'fade') => {
        telemetry.captureStart('selectInitialScreen');
        const {dispatch, getState} = this.store;
        const {entities} = getState();
        let screen = 'Channel';

        Client4.setUrl('http://192.168.0.18:8065');
        Client4.setToken('fsxkw6cfztndik6epth9qxe84c');
        if (entities) {
            const {credentials} = entities.general;

            if (credentials.token && credentials.url) {
                // fsxkw6cfztndik6epth9qxe84c
                Client4.setUrl(credentials.url);
                Client4.setToken(credentials.token);
                screen = 'Channel';
                const tracker = require('app/utils/time_tracker');
                tracker.initialLoad = Date.now();
                dispatch(loadMe());
            }
        }
        telemetry.captureEnd('selectInitialScreen');
        telemetry.captureStart('mattermostInitiliaze');
        telemetry.captureStart('startSingleScreenApp');
        Navigation.startSingleScreenApp({
            screen: {
                screen,
                navigatorStyle: {
                    navBarHidden: true,
                    statusBarHidden: false,
                    statusBarHideWithNavBar: false,
                    screenBackgroundColor: 'transparent',
                },
            },
            passProps: {
                allowOtherServers: this.emm.getAllowOtherServers(),
            },
            appStyle: {
                orientation: 'auto',
            },
            animationType,
        });

        this.push_notification.setAppStarted();
        telemetry.captureSinceLaunch('splashscreen');
    };
}