import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * CustomActions component provides a button that, when pressed, displays an action sheet with options to choose from library, take picture, send location, or cancel.
 * 
 * @component
 * @param {Object} props - The properties object.
 * @param {import("react-native").StyleProp<import("react-native").ViewStyle>} props.wrapperStyle - Custom styles for the wrapper.
 * @param {import("react-native").StyleProp<import("react-native").TextStyle>} props.iconTextStyle - Custom styles for the icon text.
 * @param {Function} props.onSend - Function to send the selected action result.
 * @param {{_id: string, name: string}} props.user - The user object containing user details.
 * @param {string} props.messageId - The unique identifier for the message.
 * @param {import("firebase/storage").FirebaseStorage} props.storage - The storage object for handling image uploads.
 * 
 * @requires react
 * @requires react-native
 * @requires '@expo/react-native-action-sheet'
 * @requires expo-location
 * @requires expo-image-picker
 * @requires firebase/storage
 * 
 * @returns {React.JSX.Element}
 */
export default function CustomActions({ wrapperStyle, iconTextStyle, onSend, user, messageId, storage }) {

    /**
     * An instance of the ActionSheet API, which provides methods to display an action sheet.
     * @type {import("@expo/react-native-action-sheet").ActionSheetProps}
     * @property {Function} showActionSheetWithOptions - Displays the action sheet with the given options.
     * @property {Function} hideActionSheet - Hides the currently displayed action sheet.
     */
    const actionSheet = useActionSheet();

    /**
     * @private
     * @function onActionPress
     * @description Displays the action sheet with options to choose from library, take picture, send location, or cancel.
     * @returns {void}
     */
    function onActionPress() {
        const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'],
            cancelButtonIndex = options.length - 1;
        actionSheet.showActionSheetWithOptions({ options, cancelButtonIndex }, buttonIndex => {
            switch (buttonIndex) {
                case 0:
                    pickImage();
                    return;
                case 1:
                    takePhoto();
                    return;
                case 2:
                    getLocation();
                    return;
                default:
            }
        });
    }

    /**
     * @private
     * @async
     * @function getLocation
     * @returns {Promise<void>}
     * @description Sends a location message to the chat
     */
    async function getLocation() {
        let permissions = await Location.requestForegroundPermissionsAsync();
        if (permissions?.granted) {
            const location = await Location.getCurrentPositionAsync({});
            if (location) {
                onSend([{
                    _id: messageId,
                    text: '',
                    createdAt: new Date(),
                    user: user,
                    location: {
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                    }
                }]);
            } else Alert.alert("Error occurred while fetching location");
        } else Alert.alert("Permissions haven't been granted.");
    }

    /**
     * @private
     * @async
     * @function pickImage
     * @returns {Promise<void>}
     * @description Allows user to pick an image from their library and sends it to the chat
     */
    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled) {
            const imageURI = result.assets[0].uri;
            const image = await fetch(imageURI);
            const imageBlob = await image.blob();
            const storageRef = ref(storage, `images/${messageId}`); // I took the messageId, because it links the image to the message
            const uploadResult = await uploadBytes(storageRef, imageBlob);
            const imageURL = await getDownloadURL(uploadResult.ref);
            onSend([{
                _id: messageId,
                text: '',
                createdAt: new Date(),
                user: user,
                imageURL // The gifted chat image viewer is not working, so I decided to use a custom image viewer
            }]);
        }
    }

    /**
     * @private
     * @async
     * @function takePhoto
     * @returns {Promise<void>}
     * @description Allows user to take a photo and sends it to the chat
     */
    async function takePhoto() {
        let permissions = await ImagePicker.requestCameraPermissionsAsync();
        if (permissions?.granted) {
            let result = await ImagePicker.launchCameraAsync();
            if (!result.canceled) {
                const imageURI = result.assets[0].uri;
                const image = await fetch(imageURI);
                const imageBlob = await image.blob();
                const storageRef = ref(storage, `images/${messageId}`); // I took the messageId, because it links the image to the message
                const uploadResult = await uploadBytes(storageRef, imageBlob);
                const imageURL = await getDownloadURL(uploadResult.ref);
                onSend([{
                    _id: messageId,
                    text: '',
                    createdAt: new Date(),
                    user: user,
                    imageURL // The gifted chat image viewer is not working, so I decided to use a custom image viewer
                }]);
            }
        }
    };

    return (
        <TouchableOpacity style={{
            width: 26,
            height: 26,
            marginLeft: 10,
            marginBottom: 10
        }} onPress={onActionPress} accessible={true} accessibilityLabel="More options" accessibilityHint="Lets you choose to send an image or your location.">
            <View style={
                [
                    {
                        flex: 1,
                        borderRadius: 13,
                        borderColor: '#b2b2b2',
                        borderWidth: 2,
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    wrapperStyle
                ]
            }>
                <Text style={
                    [
                        {
                            color: '#b2b2b2',
                            fontSize: 10,
                            fontWeight: 'bold',
                            backgroundColor: 'transparent'
                        },
                        iconTextStyle
                    ]
                }>+</Text>
            </View>
        </TouchableOpacity>
    );
}