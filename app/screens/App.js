import React, { Component } from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    View
} from 'react-native';
import {intlShape} from 'react-intl';

import {getTranslations} from 'app/i18n';

import telemetry from '../../telemetry';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            orientation: this.getOrientation(Dimensions.get('window')),
        };

        Dimensions.addEventListener('change', this.setOrientation);
    }

    componentDidMount() {
        telemetry.captureEnd('mattermostInitiliaze');
        telemetry.sendMetrics();
    }

    getOrientation = (window) => {
        const {height, width} = window;
        let orientation = 'PORTRAIT';
        if (width > height) {
            orientation = 'LANDSCAPE';
        }

        return orientation;
    };

    setOrientation = ({window}) => {
        this.setState({
            orientation: this.getOrientation(window),
        });
    };


    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to React Native!
                </Text>
                <Text style={styles.instructions}>
                    To get started, edit App.js
                </Text>
                <Text style={styles.instructions}>
                    {instructions}
                </Text>
                <Text style={styles.instructions}>
                    {this.state.orientation}
                </Text>
                <Text style={styles.instructions}>
                    {'TRANSLATIONS BELOW'}
                </Text>
                <Text style={styles.instructions}>
                    {'English ' + this.context.intl.formatMessage({id: 'mobile.error_handler.button'})}
                </Text>
                <Text style={styles.instructions}>
                    {'Spanish ' + getTranslations('es')['mobile.error_handler.button']}
                </Text>
                <Text style={styles.instructions}>
                    {'German ' + getTranslations('de')['mobile.error_handler.button']}
                </Text>
                <Text style={styles.instructions}>
                    {'Chinese ' + getTranslations('zh-TW')['mobile.error_handler.button']}
                </Text>
                <Text style={styles.instructions}>
                    {'Japanese ' + getTranslations('ja')['mobile.error_handler.button']}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
