import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, View, StyleSheet, Text, TextInput, TouchableHighlight, Animated, ImageBackground } from 'react-native';
import { getAuth, signInAnonymously } from "firebase/auth";
import React, { useEffect, useState, useRef } from 'react';

/**
 * @typedef {Object} StartProps
 * @property {import('@react-navigation/native').NavigationProp<any>} navigation - The navigation object for navigating between screens.
 * @property {import('firebase/app').FirebaseApp} fbApp - The Firebase app instance.
 * 
 * @component
 * @param {StartProps} props
 * 
 * @requires react
 * @requires react-native
 * @requires firebase/auth
 * 
 * @returns {React.JSX.Element}
 * 
 * @description
 * This component renders the start screen of the chat application. It includes an animated header,
 * an input field for the user's name, a selection of background colors, and a button to start chatting.
 * The component handles keyboard events to adjust the layout when the keyboard is shown or hidden.
 */
export default function Start({ navigation, fbApp }) {
    const auth = getAuth(fbApp); //TODO: #16 Add as prop

    /**
     * An array of color hex codes that can be selected as the background color of the chat screen.
     * @type {string[]}
     */
    const colors = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

    /**
     * State hook for managing the selected color.
     * Initializes with the third color from the colors array.
     *
     * @type {[string, React.Dispatch<React.SetStateAction<string>>]} selectedColor - The current selected color and a function to update it.
     */
    const [selectedColor, setSelectedColor] = useState(colors[2]);

    /**
     * State hook for managing the user's name.
     * 
     * @type {[string, React.Dispatch<React.SetStateAction<string>>]} name - The current user's name and a function to update it.
     */
    const [name, setName] = useState('');

    /**
     * @constant {number} screenHeight - The height of the device's screen.
     * @constant {number} screenWidth - The width of the device's screen.
     */
    const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

    /**
     * A reference to an animated value representing the height of the header.
     * Initialized to half of the screen height.
     * 
     * @constant {Animated.Value} animateHeaderHeight - The animated value for the header height.
     */
    const animateHeaderHeight = useRef(new Animated.Value(screenHeight / 2)).current;

    /**
     * A reference to an animated value representing the height of the input container.
     * The initial height is set to 44% of the screen height.
     * 
     * @constant {Animated.Value} animateInputContainerHeight
     */
    const animateInputContainerHeight = useRef(new Animated.Value(screenHeight / 100 * 44)).current;

    /**
     * A reference to an animated value representing the width of the input container.
     * The initial width is set to 88% of the screen width.
     * 
     * @constant {Animated.Value} animateInputContainerWidth
     */
    const animateInputContainerWidth = useRef(new Animated.Value(screenWidth / 100 * 88)).current;

    /**
     * A reference to an animated value representing the margin of the input container.
     * The initial value is set to 3% of the screen height.
     * 
     * @constant {Animated.Value} animateInputContainerMargin
     */
    const animateInputContainerMargin = useRef(new Animated.Value(screenHeight / 100 * 3)).current;

    /**
     * A reference to an animated value representing the font size of the title.
     * Initialized with a starting value of 45.
     * 
     * @type {Animated.Value}
     */
    const animateTitleFontSize = useRef(new Animated.Value(45)).current;

    /**
     * Styles for the Start component.
     * 
     * @constant {StyleSheet} styles
     */
    const styles = StyleSheet.create({
        container: {
            height: '100%',
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        header: {
            width: '88%',
            justifyContent: 'center',
            alignItems: 'center',
        },
        inputContainer: {
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'space-around',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            borderRadius: 3.84
        },
        appTitle: {
            fontWeight: '600',
            color: '#fff'
        },
        textInput: {
            width: '88%',
            borderWidth: 1,
            borderColor: '#757083',
            borderRadius: 3.84,
            height: 50,
            padding: 10,
            fontSize: 16,
            fontWeight: '300',
            color: '#757083',
            opacity: 50
        },
        backgroundColorContainer: {
            gap: 8
        },
        backgroundColorLabel: {
            fontSize: 16,
            fontWeight: '300',
            color: '#757083',
            opacity: 100
        },
        backgroundColorCircleContainer: {
            flexDirection: 'row',
            width: '88%',
            height: 50,
            alignItems: 'center',
            justifyContent: 'space-around'
        },
        startChattingContainer: {
            width: '88%',
            height: 50,
            backgroundColor: '#757083',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 3.84
        },
        startChatting: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
            textAlign: 'center'
        }
    });

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            startAnimations([
                { animatedValue: animateHeaderHeight, toValue: 0 },
                { animatedValue: animateInputContainerHeight, toValue: screenHeight - e.endCoordinates.height },
                { animatedValue: animateInputContainerWidth, toValue: screenWidth },
                { animatedValue: animateInputContainerMargin, toValue: 0 },
                { animatedValue: animateTitleFontSize, toValue: 0 }
            ]);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            startAnimations([
                { animatedValue: animateHeaderHeight, toValue: screenHeight / 2 },
                { animatedValue: animateInputContainerHeight, toValue: screenHeight / 100 * 44 },
                { animatedValue: animateInputContainerWidth, toValue: screenWidth / 100 * 88 },
                { animatedValue: animateInputContainerMargin, toValue: screenHeight / 100 * 3 },
                { animatedValue: animateTitleFontSize, toValue: 45 }
            ]);
        });
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        }
    }, []);

    /**
     * @typedef {Object} Animation
     * @property {Animated.Value} animatedValue - The animated value to be animated.
     * @property {number} toValue - The target value for the animation.
     * 
     * @private
     * @function startAnimations
     * @param {Animation[]} animations 
     * @description Starts the animations for the provided animated values.
     * @returns {void}
     */
    function startAnimations(animations = []) {
        for (let { animatedValue, toValue } of animations) {
            Animated.timing(animatedValue, {
                toValue: toValue,
                duration: 50,
                useNativeDriver: false
            }).start();
        }
    };

    /**
     * @private
     * @function navigateToChat
     * @param {import('react-native').GestureResponderEvent} event
     * @description Navigates to the chat screen with the user's name and selected background color.
     * @returns {void}
     */
    function navigateToChat(event) {
        signInAnonymously(auth).then(result => navigation.navigate('Chat', {
            userID: result.user.uid,
            name: name,
            selectedColor: selectedColor
        })).catch(error => console.error('Error signing in anonymously', error));
    }

    /**
     * @typedef {Object} CircleProps
     * @property {Object} style - Additional styles for the circle container.
     * @property {boolean} touched - Flag indicating whether the circle is touched.
     * 
     * @private
     * @function Circle
     * @param {CircleProps} props - The properties object.
     * @returns {React.JSX.Element} The Circle component.
     */
    function Circle({ style, touched }) {

        /**
         * A reference to a new animated value that starts at 0 and controls the opacity of the circle.
         * 
         * @private
         * @constant {Animated.Value} fadeAnim
         */
        const fadeAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            if (touched) {
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                }).start();
            } else {
                fadeAnim.setValue(0);
            }
        }, [touched, fadeAnim]);

        return (
            <View style={{
                flexDirection: 'row',
                width: 50,
                height: 50,
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                ...style
            }}>
                {touched && <Animated.View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: 'white',
                    opacity: fadeAnim
                }} />}
            </View>
        );
    }

    return (
        <ImageBackground source={require(
            // @ts-ignore
            '../assets/backgroundImage.png')} style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <Animated.View style={[styles.header, { height: animateHeaderHeight }]}>
                    <Animated.Text style={[styles.appTitle, { fontSize: animateTitleFontSize }]}>Talk with everyone</Animated.Text>
                </Animated.View>
                <Animated.View style={[styles.inputContainer, { height: animateInputContainerHeight, width: animateInputContainerWidth, marginBottom: animateInputContainerMargin }]}>
                    <TextInput style={styles.textInput} placeholder='Enter your name' value={name} onChangeText={setName} />
                    <View style={styles.backgroundColorContainer}>
                        <Text style={styles.backgroundColorLabel}>Choose your background color</Text>
                        <View style={styles.backgroundColorCircleContainer}>
                            {colors.map((color, index) => {
                                return (
                                    <TouchableHighlight key={index} underlayColor='white' onPress={() => setSelectedColor(color)}>
                                        <Circle style={{ backgroundColor: color }} touched={selectedColor === color} />
                                    </TouchableHighlight>
                                );
                            })}
                        </View>
                    </View>
                    <TouchableHighlight style={styles.startChattingContainer} onPress={navigateToChat}>
                        <Text style={styles.startChatting}>Start Chatting</Text>
                    </TouchableHighlight>
                </Animated.View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}