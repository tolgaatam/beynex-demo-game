import Feather from 'react-native-vector-icons/dist/Feather';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, withDelay, withTiming, useAnimatedStyle, runOnJS, interpolate, Easing, Extrapolate, withSequence, cancelAnimation} from 'react-native-reanimated';
import {TouchableWithoutFeedback} from "react-native-web";

const possibleQuestion = [
    {text:'Up', answer: 'up'},
    {text: 'Left', answer: 'left'},
    {text: 'Right', answer: 'right'},
    {text: 'Down', answer: 'down'},
    {text: 'Not Up', answer: 'up', not: true},
    {text: 'Not Left', answer: 'left', not: true},
    {text: 'Not Down', answer: 'down', not: true},
    {text: 'Not Right', answer: 'right', not: true},
    {text: 'Not Not Up', answer: 'up'},
    {text: 'Not Not Left', answer: 'left'},
    {text: 'Not Not Down', answer: 'down'},
    {text: 'Not Not Right', answer: 'right'},
]

const {width} = Dimensions.get('screen');

const greenLight = 'rgba(72, 207, 173, 1.0)'
const greenLightAlpha = 'rgba(72, 207, 173, .6)'
const whiteAlpha = 'rgba(255,255,255, .6)'
const red = 'rgba(237, 85, 101, 1)'

function uniqueRandom (current,max){
    let random = Math.floor(Math.random() * max)
    while(random === current){
        random = Math.floor(Math.random() * max)
    }
    return random
}


export default function DemoGame() {
    //state variables to control question, score, start counter and game state
    const [random,setRandom] = useState(Math.floor( Math.random() * possibleQuestion.length ))
    const [trueCount,setTrueCount] = useState(0)
    const [counter, setCounter] = useState(3)
    const [isPlaying, setGameState] = useState(false)

    //animation values
    const animVal = useSharedValue(0)
    const indicatorVal = useSharedValue(0)
    const gameTemplateVal = useSharedValue(0)

    const leftClickVal = useSharedValue(-1);
    const upClickVal = useSharedValue(-1);
    const rightClickVal = useSharedValue(-1);
    const downClickVal = useSharedValue(-1);

    //variables related game, animations and flags (some variables added even they are already presented beacause state variables in listeners doesn't get updated but ref variables does.)
    const gameplay = useRef({
        result: false,
        currentRound : 1,
        totalRound: 20,
        disableButtons: false,
        isPlaying: false,
        random: random
    })

    //start timer
    const startTimer = useCallback(()=>{
        animVal.value = withTiming(1, { duration: gameplay.current.currentRound <= 5 ? 2500 : gameplay.current.currentRound <= 10 ? 2000 : gameplay.current.currentRound <= 15 ? 1500 : 1000, easing: Easing.linear },()=>{
            gameplay.current.disableButtons = true
            animVal.value = 0
            if(gameplay.current.currentRound === gameplay.current.totalRound){
                setGameState(false)
                gameplay.current.isPlaying = false
            }else{
                const rand = uniqueRandom(gameplay.current.random, possibleQuestion.length)
                indicatorVal.value = withSequence(withTiming(gameplay.current.result ? 1 : -1, {duration: 100}, ()=>{
                    gameplay.current.result = false
                    gameplay.current.random = rand
                    runOnJS(setRandom)(rand)
                }),withDelay(150, withTiming(0, {duration: 250}, ()=>{
                    gameplay.current.currentRound++
                    gameplay.current.disableButtons = false

                    startTimer()
                })))
            }

        })
    },[])

    //on play pressed
    const onPressPlay = useCallback(()=> {
        //reset all game variables
        setTrueCount(0)
        setCounter(3)
        setGameState(true)
        gameplay.current.random = uniqueRandom(random, possibleQuestion.length)
        setRandom( gameplay.current.random)
        gameplay.current.currentRound = 1
        gameplay.current.isPlaying = true
        gameplay.current.disableButtons = false

        //
        let i = 3

        const interval = setInterval(() => {
            if(i !== 0){
                setCounter(counter => i === 1 ? 'Start!' : counter -1)
                i--
            }else{
                clearInterval(interval)
                gameTemplateVal.value = withTiming(1, {}, () => {
                    startTimer()
                })
            }
        }, 1000);
    },[])

    const animatePressedArrowButton = (val) => {
        val.value = withSequence(withTiming(0, {duration: 100}), withTiming(-1, {duration: 100}))
    }

    //on arrows pressed
    const onPressArrow = (direction) => {
        if(!gameplay.current.disableButtons && gameplay.current.isPlaying){
            gameplay.current.disableButtons = true

            switch (direction){
                case 'left':
                    animatePressedArrowButton(leftClickVal)
                    break;
                case 'up':
                    animatePressedArrowButton(upClickVal)
                    break;
                case 'right':
                    animatePressedArrowButton(rightClickVal)
                    break;
                case 'down':
                    animatePressedArrowButton(downClickVal)
                    break;
            }

            gameplay.current.result = (!possibleQuestion[gameplay.current.random].not && possibleQuestion[gameplay.current.random].answer === direction) || (possibleQuestion[gameplay.current.random].not && possibleQuestion[gameplay.current.random].answer !== direction)
            if(gameplay.current.result){
                setTrueCount(trueCount => trueCount + 1)
            }
            cancelAnimation(animVal)
        }
    }

    //event listener to handle keyboard inputs
    useEffect(()=>{
        let listenerFunc = (e)=>{
            e.preventDefault();
            switch (e.keyCode) {
                case 38:
                    // up arrow
                    onPressArrow('up')
                    break;
                case 40:
                    onPressArrow('down')
                    // down arrow
                    break;
                case 37:
                    onPressArrow('left')
                    // left arrow
                    break;
                case 39:
                    onPressArrow('right')
                // right arrow
            }
        }
        document.addEventListener('keydown',listenerFunc)
        return ()=> document.removeEventListener('keydown', listenerFunc)
    },[])

    //game finished
    useEffect(()=>{
        if(!isPlaying){
            gameTemplateVal.value = withTiming(0)
        }
    },[isPlaying])

    //game template animation style
    const gameTemplate = useAnimatedStyle(()=> {
        const opacity = interpolate(
            gameTemplateVal.value,
            [0,0.5,0.6],
            [1,0,0],
        )

        const x = interpolate(
            gameTemplateVal.value,
            [0,0.5,0.6],
            [0,0, width],
        )

        return {
            opacity: opacity,
            transform: [
                {
                    translateX: x
                }
            ]
        }
    })

    //timer animation style
    const timer = useAnimatedStyle(()=>{
        const translate = interpolate(animVal.value,
            [0,1],
            [-200,0]
        )

        return {
            transform: [
                {translateX: translate}
            ]
        }
    })

    //correct answer animation style
    const correctIndicator = useAnimatedStyle(()=>{
        return {
            opacity: indicatorVal.value
        }
    })

    //false answer animation style
    const falseIndicator = useAnimatedStyle(()=>{
        const opacity = interpolate(indicatorVal.value,
            [-1,0],
            [1,0],
            Extrapolate.CLAMP
        )

        return {
            opacity: opacity
        }
    })

    const leftIndicator = useAnimatedStyle(()=>{
        const opacity = interpolate(leftClickVal.value,
            [-1,0],
            [1,0.4],
            Extrapolate.CLAMP
        )

        return {
            opacity: opacity
        }
    })

    const upIndicator = useAnimatedStyle(()=>{
        const opacity = interpolate(upClickVal.value,
            [-1,0],
            [1,0.4],
            Extrapolate.CLAMP
        )

        return {
            opacity: opacity
        }
    })

    const rightIndicator = useAnimatedStyle(()=>{
        const opacity = interpolate(rightClickVal.value,
            [-1,0],
            [1,0.4],
            Extrapolate.CLAMP
        )

        return {
            opacity: opacity
        }
    })

    const downIndicator = useAnimatedStyle(()=>{
        const opacity = interpolate(downClickVal.value,
            [-1,0],
            [1,0.4],
            Extrapolate.CLAMP
        )

        return {
            opacity: opacity
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.questionText} selectable={false}>
                    {possibleQuestion[random].text}
                </Text>
                <Animated.View style={[styles.indicator, correctIndicator]}>
                    <Feather name='check' size={40} color={'white'}/>
                </Animated.View>
                <Animated.View style={[styles.indicator, falseIndicator, {backgroundColor: red}]}>
                    <Feather name='x' size={40} color={'white'}/>
                </Animated.View>
            </View>
            <View style={styles.timerContainer}>
                <Animated.View style={[styles.timer, timer]}/>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableWithoutFeedback onPress={()=>onPressArrow('up')}>
                    <Animated.View style={[styles.button, upIndicator]}>
                        <Feather name='arrow-up' size={32} color={'white'}/>
                    </Animated.View>
                </TouchableWithoutFeedback>
                <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between',}}>

                    <TouchableWithoutFeedback onPress={()=>onPressArrow('left')}>
                        <Animated.View style={[styles.button, leftIndicator]}>
                            <Feather name='arrow-left' size={32} color={'white'}/>
                        </Animated.View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback onPress={()=>onPressArrow('right')}>
                        <Animated.View style={[styles.button, rightIndicator]}>
                            <Feather name='arrow-right' size={32} color={'white'}/>
                        </Animated.View>
                    </TouchableWithoutFeedback>

                </View>
                <TouchableWithoutFeedback onPress={()=>onPressArrow('down')}>
                    <Animated.View style={[styles.button, downIndicator]}>
                        <Feather name='arrow-down' size={32} color={'white'}/>
                    </Animated.View>
                </TouchableWithoutFeedback>

            </View>

            <Animated.View style={[styles.gameComponent, gameTemplate]}>

                <Text style={{fontSize: 100, position: 'absolute', color: 'white'}}>
                    {counter}
                </Text>
                {
                    !isPlaying &&
                    <Animated.View style={styles.scoreTable}>
                        <Text style={[styles.title]}>
                            {'Swipy Mind'}
                        </Text>
                        <Text style={[styles.welcomeText, {textAlign: 'center'}, gameplay.current.currentRound !== 1 ? {height: 1, visibility: 'hidden'}:{}]}>
                            {'Welcome to Swipy Mind, a mini flexibility game!'}
                        </Text>
                        <View style={{display: gameplay.current.currentRound === 1 ? 'none': 'flex', flexDirection: 'row', marginTop: 32, justifyContent: "space-evenly"}}>
                            <View style={styles.correctTextContainer}>
                                <Text style={[{color: greenLight, fontWeight: '600', fontSize: 28}]}>
                                    {gameplay.current.currentRound !== 1 ? trueCount : '-'}
                                </Text>
                                <Text style={[styles.correctText]} >
                                    {'CORRECT'}
                                </Text>
                            </View>
                            <View style={styles.incorrectTextContainer}>
                                <Text style={[{color: "rgba(240,100,100,1.0)", fontWeight: '600', fontSize: 28,}]}>
                                    {gameplay.current.currentRound !== 1 ? (gameplay.current.totalRound - trueCount) : '-'}
                                </Text>
                                <Text style={[styles.incorrectText]}>
                                    {'INCORRECT'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity activeOpacity={0.9} style={styles.playButton} onPress={onPressPlay}>
                            <Text style={styles.playText}>
                                {gameplay.current.currentRound === 1 ? 'Play': 'Play again'}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.footer}>
                            {'Developed by Beynex'}
                        </Text>
                    </Animated.View>
                }

            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    box: {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: 'rgba(230, 233, 237, 1.0)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginTop: 10,
    },
    timerContainer: {
        width: 200,
        height: 10,
        borderRadius: 100,
        borderWidth: 2,
        borderColor:greenLight,
        overflow: 'hidden',
        marginTop: 16
    },
    timer: {
        width: '100%',
        height: '100%',
        backgroundColor: greenLight
    },
    buttonContainer: {
        marginTop: 40,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 200,
        width: 200
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: whiteAlpha,
        backgroundColor: greenLight,
        justifyContent :'center',
        alignItems: 'center',
        cursor: 'pointer'
    },
    indicator: {
        width: '100%',
        height: '100%',
        backgroundColor: greenLight,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
    },
    gameComponent: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: greenLight,
        top: 0,
        left: 0,
        justifyContent :'center',
        alignItems: 'center',
        flex: 1,
    },
    scoreTable: {
        borderRadius: 20,
        backgroundColor: 'white',
        paddingHorizontal: 60,
        paddingVertical: 40,
        borderWidth: 20,
        borderColor: greenLightAlpha,
    },
    scoreTableInner: {
        borderRadius: 20,
        paddingHorizontal: 120,
        paddingVertical: 120,
        backgroundColor: 'rgba(72, 207, 173, .66)',
    },
    playButton: {
        borderRadius: 100,
        height: 58,
        width: "100%",
        paddingHorizontal: 20,
        marginTop: 30,
        justifyContent: "center",
        backgroundColor: greenLight,
        alignItems: "center",
        borderWidth: 4,
        borderColor: whiteAlpha,
        minWidth: 200
    },
    playText: {
        fontSize: 20,
        textAlign: "center",
        fontWeight: "600",
        color: "white"
    },
    correctText: {
        color: greenLight,
        fontWeight: '600',
        marginTop: 10,
        fontSize: 14
    },
    correctTextContainer: {
        alignItems: 'center',
        width: "33%",
        paddingVertical: 7,
        borderRadius: 10,
        borderWidth: 2,
        backgroundColor: "rgba(200,245,200,0.33)",
        borderColor: greenLightAlpha,
        minWidth: 100
    },
    incorrectTextContainer: {
        alignItems: 'center',
        width: "33%",
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: "rgba(245,200,200,0.2)",
        borderWidth: 2,
        borderColor: "rgba(240,140,140,0.65)",
        minWidth: 100
    },
    incorrectText: {
        color: "rgba(240,140,140,1.0)",
        fontWeight: '600',
        marginTop: 10,
        fontSize: 14
    },
    welcomeText: {
        color: "rgba(74,76,90,0.65)",
        marginTop: 16,
        alignSelf: "center",
        fontSize: 18,
        fontWeight: '400'
    },
    title: {
        color: "rgba(74,76,90,1.0)",
        marginTop: 16,
        alignSelf: "center",
        fontSize: 34,
        fontWeight: '700'
    },
    questionText: {
        fontSize: 23,
        fontWeight: '400',
        color: "rgba(74,76,90,1.0)"
    },
    footer: {
        color: "rgba(74,76,90,0.75)",
        marginTop: 20,
        alignSelf: "center",
        fontSize: 10,
        fontWeight: '400'
    }
});
