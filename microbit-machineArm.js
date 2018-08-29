// MARK: - Properties

let p0Name = AnalogPin.P0.toString()    // hand: x axis of joystick 0
let p1Name = AnalogPin.P1.toString()    // front with hand: x axis of joystick1
let p2Name = AnalogPin.P2.toString()    // rear front: y of joystick 0
let p3Name = AnalogPin.P3.toString()    // rear base: y of joystick 1

let isCalibrating = false;

let handDefault = pins.analogReadPin(AnalogPin.P0)
let frontHandDefault = pins.analogReadPin(AnalogPin.P1)
let rearFrontDefault = pins.analogReadPin(AnalogPin.P2)
let rearBaseDefault = pins.analogReadPin(AnalogPin.P3)

let factoryDefaultHandPos = 500;
let factoryDefaultFrontHandPos = 1000;
let factoryDefaultRearFrontPos = 2045;
let factoryDefaultRearBasePos = 1500;

let currentHandPos = factoryDefaultHandPos;
let currentHandPosName = "handPos";
let currentFrontHandPos = factoryDefaultFrontHandPos;
let currentFrontHandPosName = "frontHandPos";
let currentRearFrontPos = factoryDefaultRearFrontPos;
let currentRearFrontPosName = "rearFrontPos";
let currentRearBasePos = factoryDefaultRearBasePos;
let currentRearBasePosName = "rearBasePos";

let saveHandPosIndex = 0;
let saveFrontHandPosIndex = 1;
let saveRearFrontPosIndex = 2;
let saveRearBasePosIndex = 3;
let isNeedToSavePosArray = [false, false, false, false];

let isHandLoopExecuting = true;
let isFrontHandLoopExecuting = true;
let isRearFrontLoopExecuting = true;
let isRearBaseLoopExecuting = true;

let joyStick = {

    // for save data purpose
    p0Name: ["handMin", "handMax"],
    p1Name: ["frontHandMin", "frontHandMax"],
    p2Name: ["rearFrontMin", "rearFrontMax"],
    p3Name: ["rearBaseMin", "rearBaseMax"],
    arrayIndex: [AnalogPin.P0, AnalogPin.P1, AnalogPin.P2, AnalogPin.P3],
    arrayRangeValueIndex: ["handMin", "handMax", "frontHandMin", "frontHandMax", "rearFrontMin"
        , "rearFrontMax", "rearBaseMin", "rearBaseMax"],

    // for use data purpose
    handMin: 0,
    handMax: 1023,
    frontHandMin: 0,
    frontHandMax: 1023,
    rearFrontMin: 0,
    rearFrontMax: 1023,
    rearBaseMin: 0,
    rearBaseMax: 1023
}

let handEvent = 1001
let handEventValue = 1001
let frontHandEvent = 1002
let frontHandEventValue = 1002
let rearFrontEvent = 1003
let rearFrontEventValue = 1003
let rearBaseEvent = 1004
let rearBaseEventValue = 1004

let resetToInitPositionEvent = 2000
let resetToInitPositionEventValue = 2000

let joyStickMappedItem = [joyStick.p0Name, joyStick.p1Name, joyStick.p2Name, joyStick.p3Name]
let joyStickRangeMappedItem = [joyStick.handMin, joyStick.handMax, joyStick.frontHandMin, joyStick.frontHandMax
    , joyStick.rearFrontMin, joyStick.rearFrontMax, joyStick.rearBaseMin, joyStick.rearBaseMax]


// MARK: - Methods

function dumps() {
    let valueIndex = -1
    joyStickMappedItem.forEach((value: string[], index: number) => {
        value.forEach((value: string, index: number) => {

            valueIndex = joyStick.arrayRangeValueIndex.indexOf(value)
            if (valueIndex != -1) {
                serial.writeValue(joyStick.arrayRangeValueIndex[index]
                    , files.settingsReadNumber(value))
            }
            basic.pause(100)
        })
    })

    serial.writeValue(currentHandPosName, files.settingsReadNumber(currentHandPosName))
    basic.pause(100)
    serial.writeValue(currentFrontHandPosName, files.settingsReadNumber(currentFrontHandPosName))
    basic.pause(100)
    serial.writeValue(currentRearFrontPosName, files.settingsReadNumber(currentRearFrontPosName))
    basic.pause(100)
    serial.writeValue(currentRearBasePosName, files.settingsReadNumber(currentRearBasePosName))
}

function retrieveData() {
    let index = -1
    joyStickMappedItem.forEach((value: string[], index: number) => {
        value.forEach((value: string, index: number) => {

            index = joyStick.arrayRangeValueIndex.indexOf(value)
            let temp_value = files.settingsReadNumber(value)
            if (index != -1 && temp_value != -1) {
                joyStickRangeMappedItem[index] = temp_value
                //serial.writeValue(joyStick.arrayRangeValueIndex[index]
                //    , joyStickRangeMappedItem[index])
            }
            basic.pause(100)
        })
    })

    let temp_value = files.settingsReadNumber(currentHandPosName);
    if (temp_value != -1) {
        currentHandPos = temp_value;
    }
    basic.pause(100)
    temp_value = files.settingsReadNumber(currentFrontHandPosName);
    if (temp_value != -1) {
        currentFrontHandPos = temp_value;
    }
    basic.pause(100)
    temp_value = files.settingsReadNumber(currentRearFrontPosName);
    if (temp_value != -1) {
        currentRearFrontPos = temp_value;
    }
    basic.pause(100)
    temp_value = files.settingsReadNumber(currentRearBasePosName);
    if (temp_value != -1) {
        currentRearBasePos = temp_value;
    }
    basic.pause(100)
}

function saveData(pin: AnalogPin, minValue: number, maxValue: number) {
    let index = joyStick.arrayIndex.indexOf(pin)
    if (index != -1) {
        let array = joyStickMappedItem[index]
        files.settingsSaveNumber(array[0], minValue)
        files.settingsSaveNumber(array[1], maxValue)
    }
}

//function calibrate(inputPin1: AnalogPin, inputPin2: AnalogPin, arrow1: ArrowNames, arrow2: ArrowNames) {
function calibrate(inputPin1: AnalogPin, inputPin2: AnalogPin, arrow1: string, arrow2: string) {
    let loopCount = 0
    let tempValue = 0
    let min1 = pins.analogReadPin(inputPin1)
    let max1 = min1
    let min2 = pins.analogReadPin(inputPin2)
    let max2 = min2

    while (loopCount < 2) {
        for (let i = 0; i < 5; i++) {
            //led.enable(true)
            //basic.showArrow(arrow1)
            //basic.pause(50)
            //led.enable(false)
            serial.writeLine(arrow1)

            tempValue = pins.analogReadPin(inputPin1)
            if (tempValue < min1) {
                min1 = tempValue
            } else if (tempValue > max1) {
                max1 = tempValue
            }

            tempValue = pins.analogReadPin(inputPin2)
            if (tempValue < min2) {
                min2 = tempValue
            } else if (tempValue > max2) {
                max2 = tempValue
            }
            //basic.pause(50)
            serial.writeValue("min1", min1)
            serial.writeValue("max1", max1)
            serial.writeValue("min2", min2)
            serial.writeValue("max2", max2)
        }

        for (let i = 0; i < 5; i++) {
            //led.enable(true)
            //basic.showArrow(arrow2)
            //basic.pause(50)
            //led.enable(false)
            serial.writeLine(arrow2)

            tempValue = pins.analogReadPin(inputPin1)
            if (tempValue < min1) {
                min1 = tempValue
            } else if (tempValue > max1) {
                max1 = tempValue
            }

            tempValue = pins.analogReadPin(inputPin2)
            if (tempValue < min2) {
                min2 = tempValue
            } else if (tempValue > max2) {
                max2 = tempValue
            }
            //basic.pause(50)
            serial.writeValue("min1", min1)
            serial.writeValue("max1", max1)
            serial.writeValue("min2", min2)
            serial.writeValue("max2", max2)
        }

        loopCount++;
        basic.pause(50)
    }
    saveData(inputPin1, min1, max1)
    saveData(inputPin2, min2, max2)
}

function servoControl(inputPin: AnalogPin
    , outputPin: AnalogPin, min: number
    , max: number, defaultValue: number, currentPos: number
    , currentPosName: string, isNeedSaveIndex: number) {
    let diffPos = pins.map(pins.analogReadPin(inputPin), min, defaultValue, -3, 0)
    diffPos = (pins.map(pins.analogReadPin(inputPin), defaultValue, max, 0, 3) + diffPos) / 2
    if (diffPos != 0) {
        currentPos += diffPos;
        currentPos = (currentPos <= 500) ? 500 : (currentPos >= 2500) ? 2500 : currentPos;
        pins.servoSetPulse(outputPin, currentPos);
        isNeedToSavePosArray[isNeedSaveIndex] = true
    } else if (isNeedToSavePosArray[isNeedSaveIndex]) {
        serial.writeLine("save currentPos")
        serial.writeValue(currentPosName, currentPos)
        files.settingsSaveNumber(currentPosName, currentPos)
        basic.pause(100)
        isNeedToSavePosArray[isNeedSaveIndex] = false
    }

    return currentPos;
}

function servoControlBySystem(outputPin: AnalogPin, oldPosition: number, newPosition: number) {
    let diff = (oldPosition > newPosition) ? -3 : 3
    while (oldPosition != newPosition) {
        oldPosition += diff
        oldPosition = (oldPosition <= newPosition) ? newPosition : (oldPosition >= newPosition) ? newPosition : oldPosition;
        pins.servoSetPulse(outputPin, oldPosition)
        basic.pause(5)
    }
}

function writeToSettingsTest() {
    joyStick.arrayIndex.forEach((value: AnalogPin, index: number) => {
        let val1 = Math.random(1023)
        let val2 = Math.random(1023)
        saveData(value, val1, val2)
        serial.writeLine("pin number: " + value.toString())
        serial.writeNumbers([val1, val2])
    })
}

function executeEvents() {
    control.raiseEvent(handEvent, handEventValue)
    control.raiseEvent(frontHandEvent, frontHandEventValue)
    control.raiseEvent(rearFrontEvent, rearFrontEventValue)
    control.raiseEvent(rearBaseEvent, rearBaseEventValue)
}

// MARK: - Interrupts

input.onButtonPressed(Button.AB, () => {
    isCalibrating = true;
    while (!(isHandLoopExecuting == false && isFrontHandLoopExecuting == false
        && isRearFrontLoopExecuting == false && isRearBaseLoopExecuting == false)) {
        basic.pause(100)
    }
    //calibrate(AnalogPin.P0, AnalogPin.P1, ArrowNames.West, ArrowNames.East)
    //calibrate(AnalogPin.P2, AnalogPin.P3, ArrowNames.North, ArrowNames.South)
    calibrate(AnalogPin.P0, AnalogPin.P1, "turn to left", "turn to right")
    calibrate(AnalogPin.P2, AnalogPin.P3, "turn to up", "turn to down")

    isCalibrating = false;
    executeEvents()
})

input.onButtonPressed(Button.A, () => {
    dumps()
})

control.onEvent(handEvent, handEventValue, () => {
    while (true) {
        if (!isCalibrating) {
            currentHandPos = servoControl(AnalogPin.P0, AnalogPin.P6
                , joyStick.handMin, joyStick.handMax, handDefault
                , currentHandPos, currentHandPosName, saveHandPosIndex)
        } else {
            isHandLoopExecuting = false
            break
        }
        basic.pause(5);
    }
})

control.onEvent(frontHandEvent, frontHandEventValue, () => {
    while (true) {
        if (!isCalibrating) {
            currentFrontHandPos = servoControl(AnalogPin.P1, AnalogPin.P7
                , joyStick.frontHandMin, joyStick.frontHandMax
                , frontHandDefault, currentFrontHandPos, currentFrontHandPosName, saveFrontHandPosIndex)
        } else {
            isFrontHandLoopExecuting = false
            break
        }
        basic.pause(5);
    }
})

control.onEvent(rearFrontEvent, rearFrontEventValue, () => {
    while (true) {
        if (!isCalibrating) {
            currentRearFrontPos = servoControl(AnalogPin.P2, AnalogPin.P8
                , joyStick.rearFrontMin, joyStick.rearFrontMax
                , rearFrontDefault, currentRearFrontPos, currentRearFrontPosName, saveRearFrontPosIndex)
        } else {
            isRearFrontLoopExecuting = false
            break
        }
        basic.pause(5);
    }
})

control.onEvent(rearBaseEvent, rearBaseEventValue, () => {
    while (true) {
        if (!isCalibrating) {
            currentRearBasePos = servoControl(AnalogPin.P3, AnalogPin.P9
                , joyStick.rearBaseMin, joyStick.rearBaseMax
                , rearBaseDefault, currentRearBasePos, currentRearBasePosName, saveRearBasePosIndex)
        } else {
            isRearBaseLoopExecuting = false
            break
        }
        basic.pause(5);
    }
})

control.onEvent(resetToInitPositionEvent, resetToInitPositionEventValue, () => {
    servoControlBySystem(AnalogPin.P6, currentHandPos, factoryDefaultHandPos)
    servoControlBySystem(AnalogPin.P7, currentFrontHandPos, factoryDefaultFrontHandPos)
    servoControlBySystem(AnalogPin.P8, currentRearFrontPos, factoryDefaultRearFrontPos)
    servoControlBySystem(AnalogPin.P9, currentRearFrontPos, factoryDefaultRearBasePos)
    serial.writeLine("Init is finished.")
    executeEvents()
})

control.onEvent(EventBusSource.MICROBIT_ID_IO_P14, EventBusValue.MICROBIT_PIN_EVT_RISE, () => {
    pins.servoSetPulse(AnalogPin.P10, 1575)
})

control.onEvent(EventBusSource.MICROBIT_ID_IO_P14, EventBusValue.MICROBIT_PIN_EVT_FALL, () => {
    pins.servoSetPulse(AnalogPin.P10, 1500)
})

control.onEvent(EventBusSource.MICROBIT_ID_IO_P15, EventBusValue.MICROBIT_PIN_EVT_RISE, () => {
    pins.servoSetPulse(AnalogPin.P10, 1250)
})

control.onEvent(EventBusSource.MICROBIT_ID_IO_P15, EventBusValue.MICROBIT_PIN_EVT_FALL, () => {
    pins.servoSetPulse(AnalogPin.P10, 1500)
})

// MARK: - onStart

pins.setEvents(DigitalPin.P14, PinEventType.Edge)
pins.setEvents(DigitalPin.P15, PinEventType.Edge)

retrieveData()
led.enable(false)
serial.writeValue("currentHandPos", currentHandPos)
pins.servoSetPulse(AnalogPin.P6, currentHandPos)
basic.pause(1000)
pins.servoSetPulse(AnalogPin.P7, currentFrontHandPos)
basic.pause(1000)
pins.servoSetPulse(AnalogPin.P8, currentRearFrontPos)
basic.pause(1000)
pins.servoSetPulse(AnalogPin.P9, currentRearBasePos)
basic.pause(1000)
pins.servoSetPulse(AnalogPin.P10, 1500)
basic.pause(1000)
control.raiseEvent(resetToInitPositionEvent, resetToInitPositionEventValue)

// MARK: - onLoop

basic.forever(() => {
})
