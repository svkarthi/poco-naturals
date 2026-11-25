const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Configures production Android release signing in android/app/build.gradle
 * when POCO_RELEASE_STORE_FILE is provided in CI (e.g. via GitHub Actions secrets).
 * Falls back cleanly to Expo's default debug signing when not set.
 */
function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    if (
      !process.env.POCO_RELEASE_STORE_FILE ||
      mod.modResults.language !== 'groovy'
    ) {
      return mod;
    }

    let contents = mod.modResults.contents;
    if (contents.includes('signingConfigs.release')) {
      return mod;
    }

    contents = contents.replace(
      /signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\}\s*\}/m,
      (match) => {
        const inner = match.replace(/\}\s*$/, '');
        return `${inner}
        release {
            storeFile file(System.getenv('POCO_RELEASE_STORE_FILE'))
            storePassword System.getenv('POCO_RELEASE_STORE_PASSWORD')
            keyAlias System.getenv('POCO_RELEASE_KEY_ALIAS')
            keyPassword System.getenv('POCO_RELEASE_KEY_PASSWORD')
        }
    }`;
      }
    );

    contents = contents.replace(
      /(release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

    mod.modResults.contents = contents;
    return mod;
  });
}

module.exports = withReleaseSigning;
