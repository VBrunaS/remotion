/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// El entorno de la nube no puede descargar el navegador de Remotion; se usa el Chrome ya instalado.
Config.setBrowserExecutable('/opt/pw-browsers/chromium');
Config.setChromeMode('chrome-for-testing');
