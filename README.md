# Talk with everyone
This application allows users to anonymously chat with other users. They just need to enter some name, choose a chat background and can then chat with every other user of the app. It is possible to exchange text messages, pictures and locations.

## Techstack
- React Native: For the basic app structure
- Gifted Chat: For the chat
- Expo: For running the app on iOS and Android
- Google Firestore: For storing the messages
- react-native-maps: For the location messages

## Setup
If you have not already done it, you must install NPM first. Check out how to do this here: [Install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

You need a Google Firestore database to run this project.

To run this application you have to create a .env file in the root directory of this project. The .env file must contain the following key-value-pairs:

```
FB_API_KEY="API Key for your Google Firebase API"
FB_AUTH_DOMAIN="The auth domain of your Google Firebase project"
FB_PROJECT_ID="The ID of your Google Firebase Project"
FB_STORAGE_BUCKET="The domain of your Google Firestore database"
FB_MESSAGING_SENDER_ID="Your Google Firebase messaging sender ID"
FB_APP_ID="Your Google Firebase app ID"
FB_MEASUREMENT_ID="Your Google Firebase measurement ID"
```

Be aware that you can test this application on iOS only if you either emulate a iOS device with Xcode on a Apple Computer or if you use a real iPhone/iPad.

If you are working on macOS you also must install 'homebrew' and 'watchman'.

First install[Homebrew](https://brew.sh).

Then use the commands
```
$ brew update
```
and
```
$ brew install watchman
```
After that run
```
$ npm install
```
from inside the directory of the cloned repository.

When installation of the npm packages is done, you have to install Android Studio as well as Apple XCode, if you have a MacBook and want to emulate a iOS device.

For the setup of a virtual Android device please follow these instructions: [Create and manage virtual devices](https://developer.android.com/studio/run/managing-avds).

For the setup of a virtual iPhone look at Apples instructions: [Running your app in Simulator or on a device](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device#Configure-the-list-of-simulated-devices).

After you have finished seting up the the emulators you have to start Expo with this command
```
npm run start
```

When Expo has started you will see a QR code. You can scan the QR code with the Expo app on your real smartphone. The projects application will then start on your real device.

Otherwise you can also click 'a' or 'i' to start the projects application on the previously created Android or iOS emulators.
