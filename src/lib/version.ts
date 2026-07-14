import pkg from "../../package.json";

/** アプリ現在バージョン（package.json = semantic-release が自動更新）。 */
export const APP_VERSION: string = pkg.version;
