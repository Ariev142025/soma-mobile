import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {API_BASE_URL} from '../constants';

const BUNDLE_DIR = `${RNFS.DocumentDirectoryPath}/soma_ota`;
const BUNDLE_PATH = `${BUNDLE_DIR}/index.bundle`;
const VERSION_FILE = `${BUNDLE_DIR}/version.txt`;

export const OTAService = {
  async getCurrentVersion(): Promise<string> {
    try {
      const exists = await RNFS.exists(VERSION_FILE);
      if (!exists) return '0.0.0';
      return (await RNFS.readFile(VERSION_FILE)).trim();
    } catch { return '0.0.0'; }
  },

  async checkAndApply(): Promise<{updated: boolean; mandatory: boolean}> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const url = `${API_BASE_URL}/ota/check?platform=${Platform.OS}&version=${currentVersion}`;
      const response = await fetch(url, {method: 'GET'});
      if (!response.ok) return {updated: false, mandatory: false};

      const data = await response.json();
      if (!data.hasUpdate || !data.bundleUrl) return {updated: false, mandatory: false};

      // Download bundle
      await RNFS.mkdir(BUNDLE_DIR);
      await RNFS.downloadFile({
        fromUrl: data.bundleUrl,
        toFile: BUNDLE_PATH,
      }).promise;

      // Verify hash
      if (data.bundleHash) {
        const hash = await RNFS.hash(BUNDLE_PATH, 'sha256');
        if (hash !== data.bundleHash) {
          await RNFS.unlink(BUNDLE_PATH);
          console.warn('OTA: hash mismatch');
          return {updated: false, mandatory: false};
        }
      }

      // Save version
      await RNFS.writeFile(VERSION_FILE, data.version);
      return {updated: true, mandatory: data.isMandatory ?? false};
    } catch (e) {
      console.warn('OTA error:', e);
      return {updated: false, mandatory: false};
    }
  },
};
