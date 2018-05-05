// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import {markChannelAsRead} from 'mattermost-redux/actions/channels';
import EventEmitter from 'mattermost-redux/utils/event_emitter';
import {Client4} from 'mattermost-redux/client/index';
import {General} from 'mattermost-redux/constants/index';
import {setDeviceToken} from 'mattermost-redux/actions/general';

import {createPost, loadFromPushNotification} from 'app/actions/views/root';
import {ViewTypes} from 'app/constants';
import {stripTrailingSlashes} from 'app/utils/url';

import PushNotifications from './push_notifications';

import telemetry from '../../../telemetry';

export default class PushNotification {
    constructor(store) {
        this.store = store;
        this.appStarted = false;

        telemetry.captureStart('configurePushNotifications');
        PushNotifications.configure({
            onRegister: this.onRegisterDevice,
            onNotification: this.onPushNotification,
            onReply: this.onPushNotificationReply,
            popInitialNotification: true,
            requestPermissions: true,
        });
    }

    cancelAllLocalNotifications = () => {
        PushNotifications.cancelAllLocalNotifications();
    };

    getNotification = () => {
        return PushNotifications.getNotification();
    };

    localNotification = (opts) => {
        PushNotifications.localNotification(opts);
    };

    static localNotificationSchedule = (opts) => {
        PushNotifications.localNotificationSchedule(opts);
    };

    onRegisterDevice = (data) => {
        const {dispatch} = this.store;
        let prefix;
        if (Platform.OS === 'ios') {
            prefix = General.PUSH_NOTIFY_APPLE_REACT_NATIVE;
            if (DeviceInfo.getBundleId().includes('rnbeta')) {
                prefix = `${prefix}beta`;
            }
        } else {
            prefix = General.PUSH_NOTIFY_ANDROID_REACT_NATIVE;
        }

        const token = `${prefix}:${data.token}`;
        dispatch(setDeviceToken(token));
        telemetry.captureEnd('configurePushNotifications');
    };

    onPushNotification = (deviceNotification) => {
        const {dispatch, getState} = this.store;
        const state = getState();
        const {token, url} = state.entities.general.credentials;

        const {data, foreground, message, userInfo, userInteraction} = deviceNotification;
        const notification = {
            data,
            message,
        };

        if (userInfo) {
            notification.localNotification = userInfo.localNotification;
        }

        if (data.type === 'clear') {
            dispatch(markChannelAsRead(data.channel_id, null, false));
        } else if (foreground) {
            EventEmitter.emit(ViewTypes.NOTIFICATION_IN_APP, notification);
        } else if (userInteraction && !notification.localNotification) {
            EventEmitter.emit('close_channel_drawer');
            if (!this.appStarted) {
                Client4.setToken(token);
                Client4.setUrl(stripTrailingSlashes(url));
            }

            dispatch(loadFromPushNotification(notification));

            if (this.appStarted) {
                EventEmitter.emit(ViewTypes.NOTIFICATION_TAPPED);
            }
        }
    };

    onPushNotificationReply = (data, text, badge, completed) => {
        const {dispatch, getState} = this.store;
        const state = getState();
        const {currentUserId} = state.entities.users;

        if (currentUserId) {
            // one thing to note is that for android it will reply to the last post in the stack
            const rootId = data.root_id || data.post_id;
            const post = {
                user_id: currentUserId,
                channel_id: data.channel_id,
                root_id: rootId,
                parent_id: rootId,
                message: text,
            };

            if (!Client4.getUrl()) {
                // Make sure the Client has the server url set
                Client4.setUrl(state.entities.general.credentials.url);
            }

            if (!Client4.getToken()) {
                // Make sure the Client has the server token set
                Client4.setToken(state.entities.general.credentials.token);
            }

            dispatch(createPost(post)).then(() => {
                dispatch(markChannelAsRead(data.channel_id));

                if (badge >= 0) {
                    PushNotifications.setApplicationIconBadgeNumber(badge);
                }

                this.replyNotificationData = null;
            }).then(completed);
        } else {
            this.replyNotificationData = {
                data,
                text,
                badge,
                completed,
            };
        }
    };

    resetNotification = () => {
        PushNotifications.resetNotification();
    };

    static setApplicationIconBadgeNumber = (number) => {
        PushNotifications.setApplicationIconBadgeNumber(number);
    };

    setAppStarted = () => {
        this.appStarted = true;
    };
}