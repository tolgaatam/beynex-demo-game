import { Feather } from 'react-native-vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS, interpolate, Easing, Extrapolate, withSequence, cancelAnimation} from 'react-native-reanimated';

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

export default function ClinicianGame(props) {

    //state variables to control question, score and game state
    const [random,setRandom] = useState(Math.floor(Math.random() * possibleQuestion.length))
    const [counter,setCounter] = useState(3)
    const [trueCount,setTrueCount] = useState(0)
    const [isGameFinished, setGameState] = useState(false)

    //animation values
    const animVal = useSharedValue(0)
    const indicatorVal = useSharedValue(0)
    const gameTemplateVal = useSharedValue(0)

    //flags to control animations and button interactions
    const result = useRef(false)
    const disableButtons = useRef(false)

    //gameplay
    const currentRound = useRef(1)
    const totalRound = useRef(12)

    //componentDidMount
    useEffect(()=>{
        let c = 3
        const interval = setInterval(() => {
            if(c === 0){
                clearInterval(interval)
                gameTemplateVal.value = withTiming(1, {duration: 200}, ()=>{
                    startTimer()
                })
            }else{
                c--
                if(c === 0){
                    setCounter('Start!')
                }else{
                    setCounter(counter => counter - 1)
                }
            }
        }, 1000);
    },[])

    // game finished
    useEffect(()=>{
        if(isGameFinished){
            gameTemplateVal.value = withTiming(0)
        }
    },[isGameFinished])

    //start timer
    const startTimer = () => {
        animVal.value = 0
        animVal.value = withTiming(1, {duration: currentRound.current <= 6 ? 2500 : 1500, easing: Easing.linear},()=>{
            disableButtons.current = true
            if(currentRound.current === totalRound.current){
                setGameState(true)
            }else{
                const rand = uniqueRandom(random, possibleQuestion.length)
                indicatorVal.value = withSequence(withTiming(result.current ? 1 : -1, {}, ()=>{
                    result.current = false
                    runOnJS(setRandom)(rand)
                }),withTiming(0, {}, ()=>{
                    currentRound.current++
                    disableButtons.current = false
                    startTimer()
                }))
            }

        })
    }

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

    //false answer indicator animation style
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

    //true answer indicator animation style
    const trueIndicator = useAnimatedStyle(()=>{
        return {
            opacity: indicatorVal.value
        }
    })

    //false answer indicator animation style
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

    //on arrow pressed
    const onPress = (direction) => {
        if(!disableButtons.current){
            disableButtons.current = true
            result.current = (!possibleQuestion[random].not && possibleQuestion[random].answer === direction) || (possibleQuestion[random].not && possibleQuestion[random].answer !== direction)
            if(result.current){
                setTrueCount(trueCount => trueCount + 1)
            }
            cancelAnimation(animVal)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={{fontSize: 23, fontWeight: '400'}} selectable={false}>
                    {possibleQuestion[random].text}
                </Text>
                <Animated.View style={[styles.indicator, trueIndicator]}>
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
                <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={()=>onPress('up')}>
                    <Feather name='arrow-up' size={32} color={'white'}/>
                </TouchableOpacity>
                <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between',}}>
                    <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={()=>onPress('left')}>
                        <Feather name='arrow-left' size={32} color={'white'}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={()=>onPress('right')}>
                        <Feather name='arrow-right' size={32} color={'white'}/>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={()=>onPress('down')}>
                    <Feather name='arrow-down' size={32} color={'white'}/>
                </TouchableOpacity>
            </View>
            <Animated.View style={[styles.gameComponent, gameTemplate]}>
                {
                    !isGameFinished ?
                        <Text style={{fontSize: 100, fontWeight: '500', color: 'white'}}>
                            {counter}
                        </Text>
                        :
                        <View style={styles.scoreTable}>
                            <TouchableOpacity style={styles.backButton} onPress={()=>props.navigation.goBack()}>
                                <Feather name='arrow-left' size={32} color={color}/>
                            </TouchableOpacity>
                            <Text style={[{color: greenLight, marginTop: 32, fontSize: 34, fontWeight: '700'}]}>
                                {'Score Table'}
                            </Text>
                            <Text style={[{color: greenLight, marginTop: 32, fontWeight: '700', fontSize: 28}]}>
                                {'True: ' + trueCount}
                            </Text>
                            <Text style={[{color: greenLight, marginTop: 16, fontWeight: '700', fontSize: 28}]}>
                                {'False: ' + (totalRound.current - trueCount)}
                            </Text>
                        </View>
                }
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    box: {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: greenLight,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
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
        alignItems: 'center'
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
        alignItems: 'center'
    },
    scoreTable: {
        borderRadius: 7,
        backgroundColor: 'white',
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderWidth: 3,
        borderColor: greenLightAlpha
    },
    backButton: {
        padding: 4,
        position: 'absolute',
        left: 16,
        top: 10
    }
});
