// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import 'intl';
import {addLocaleData} from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';

import en from 'assets/i18n/en.json';

const TRANSLATIONS = {en};

export const DEFAULT_LOCALE = 'en';

addLocaleData(enLocaleData);

function loadTranslation(locale) {
    try {
        let localeData;
        switch (locale) {
        case 'de':
            TRANSLATIONS.de = require('assets/i18n/de.json');
            localeData = require('react-intl/locale-data/de');
            addLocaleData(localeData);
            break;
        case 'es':
            console.log('LOADING ES TRANSLATIONS');
            TRANSLATIONS.es = require('assets/i18n/es.json');
            localeData = require('react-intl/locale-data/es');
            addLocaleData(localeData);
            break;
        case 'fr':
            TRANSLATIONS.fr = require('assets/i18n/fr.json');
            localeData = require('react-intl/locale-data/fr');
            addLocaleData(localeData);
            break;
        case 'it':
            TRANSLATIONS.it = require('assets/i18n/it.json');
            localeData = require('react-intl/locale-data/it');
            addLocaleData(localeData);
            break;
        case 'ja':
            TRANSLATIONS.ja = require('assets/i18n/ja.json');
            localeData = require('react-intl/locale-data/ja');
            addLocaleData(localeData);
            break;
        case 'ko':
            TRANSLATIONS.ko = require('assets/i18n/ko.json');
            localeData = require('react-intl/locale-data/ko');
            addLocaleData(localeData);
            break;
        case 'nl':
            TRANSLATIONS.nl = require('assets/i18n/nl.json');
            localeData = require('react-intl/locale-data/nl');
            addLocaleData(localeData);
            break;
        case 'pl':
            TRANSLATIONS.pl = require('assets/i18n/pl.json');
            localeData = require('react-intl/locale-data/pl');
            addLocaleData(localeData);
            break;
        case 'pt-BT':
            TRANSLATIONS[locale] = require('assets/i18n/pt-BR.json');
            localeData = require('react-intl/locale-data/pt');
            addLocaleData(localeData);
            break;
        case 'tr':
            TRANSLATIONS.tr = require('assets/i18n/tr.json');
            localeData = require('react-intl/locale-data/tr');
            addLocaleData(localeData);
            break;
        case 'ru':
            TRANSLATIONS.ru = require('assets/i18n/ru.json');
            localeData = require('react-intl/locale-data/ru');
            addLocaleData(localeData);
            break;
        case 'zh-CN':
            TRANSLATIONS[locale] = require('assets/i18n/zh-CN.json');
            localeData = require('react-intl/locale-data/zh');
            addLocaleData(localeData);
            break;
        case 'zh-TW':
            TRANSLATIONS[locale] = require('assets/i18n/zh-TW.json');
            localeData = require('react-intl/locale-data/zh');
            addLocaleData(localeData);
            break;
        }

    } catch (e) {
        console.error('NO Translation found', e)
    }
}

export function getTranslations(locale) {
    if (!TRANSLATIONS[locale]) {
        loadTranslation(locale);
    }
    return TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
}
