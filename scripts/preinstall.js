// preinstall.js

// This script will create a .nmprc file with the a read only token that can be used to grab the peak activity scoped packages.
// It is designed to be run before install so developers who don't have npm accounts will not get errors.

const fs = require('fs');
const path = require('path');
const os = require('os');

const userProfileNpmrcFile = path.join(os.homedir(), '.npmrc');

console.log(`npm token = ${process.env.npm_package_config_npm_token}`);
console.log(`build_server = ${process.env.npm_package_config_build_server}`);
console.log(`userProfileNpmrcFile = ${userProfileNpmrcFile}`);

// Check to see if they want to create this file.
// eslint-disable-next-line eqeqeq
if (process.env.npm_package_config_build_server == true) {
  console.log('Executing on build server. No .npmrc file will be created.');
  return;
}

// see if the user already has .nmprc files. If so, don't create
if (fs.existsSync('./.npmrc') || fs.existsSync(userProfileNpmrcFile)) {
  console.log('.npmrc file already exists. Skipping creation.');
  return;
}

// write the file
console.log('Creating .nmprc file');
fs.writeFileSync('./.npmrc', `//registry.npmjs.org/:_authToken=${process.env.npm_package_config_npm_token}`);
