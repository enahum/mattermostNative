import semver from 'semver';

import {UpgradeTypes} from 'app/constants/view';

import LocalConfig from 'assets/config.json';

export default function checkUpgradeType(currentVersion, minVersion, latestVersion, logError) {
    let upgradeType = UpgradeTypes.NO_UPGRADE;

    try {
        if (minVersion && semver.lt(currentVersion, minVersion)) {
            upgradeType = UpgradeTypes.MUST_UPGRADE;
        } else if (latestVersion && semver.lt(currentVersion, latestVersion)) {
            if (LocalConfig.EnableForceMobileClientUpgrade) {
                upgradeType = UpgradeTypes.MUST_UPGRADE;
            } else {
                upgradeType = UpgradeTypes.CAN_UPGRADE;
            }
        }
    } catch (error) {
        logError(error.message);
    }

    return upgradeType;
}
