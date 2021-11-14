const midiEvent = require('./x_touch_events.js').midiEvent;
const initEvents = require('./x_touch_events.js').init;
const x_touch_set = require('./x_touch_setters.js');
const LcdState = require('./LcdState');
const prompt = require('prompt-sync')({sigint: true});

const Menu = require('./strips/Menu').Menu;
const menuEvents = require('./strips/Menu').menuEvents;
const WinOutputMaster = require('./strips/WinMaster');

const deviceEvents = require('./system_devices.js').DeviceEvents;

const DEBUG = false;

// SETTING THE INTERFACE DEVICE
const Midi = require('midi');

const input = new Midi.input();
const output = new Midi.output();

const inputPortCount = input.getPortCount();
const outputPortCount = output.getPortCount();

var inputPortNames = [];
var outputPortNames = [];

// INPUT DEVICE SELECTION - E.G. MIDI CONTROLLER ADJUSTS VOLUME
for (let port = 0; port < inputPortCount; port ++) {
    let inputPortName = input.getPortName(port);

    inputPortNames.push(inputPortName); 

    console.log(port + " - " + inputPortName);
}

let inputPortSelection = prompt('Enter the MIDI device\'s number you wish to use as the input: ');
let inputPortSelectionInteger = parseInt(inputPortSelection);

if (isNaN(inputPortSelectionInteger)) {
    console.log('Input port selection must be a number.');
    process.exit(1);
} else if (inputPortSelectionInteger < 0 || inputPortSelectionInteger + 1 > inputPortCount) {
    console.log('You\'ve chosen an input port outside of the listed values.');
    process.exit(1);
} else {
    console.log("You selected '" + input.getPortName(inputPortSelectionInteger) + "' for the input port.");
}

// OUTPUT DEVICE SELECTION - E.G. WINDOWS VOLUME ADJUSTS FADER POSITION
for (let port = 0; port < outputPortCount; port ++) {
    let outputPortName = output.getPortName(port);
    outputPortNames.push(outputPortName); 
    console.log(port + " - " + outputPortName);
}

let outputPortSelection = prompt('Enter the MIDI device\'s number you wish to use as the output: ');
let outputPortSelectionInteger = parseInt(outputPortSelection);

if (isNaN(outputPortSelectionInteger)) {
    console.log('Output port selection must be a number.');
    process.exit(1);
} else if (outputPortSelectionInteger < 0 || outputPortSelectionInteger + 1 > outputPortCount) {
    console.log('You\'ve chosen an output port outside of the listed values.');
    process.exit(1);
} else {
    console.log("You selected '" + output.getPortName(outputPortSelectionInteger) + "' for the output port.");
    output.openPort(outputPortSelectionInteger);
}

// CONFIGURE INPUT/OUTPUT PORTS AND START UP EVENTS
initEvents(inputPortSelectionInteger);

// Set all strips to root selection menu at first.
// TODO: load from saved state, including the device selection. Handle command line request to "reset".
const stripStates = {
    1: new Menu(1, 'ROOT_MENU', output),
    2: new Menu(2, 'ROOT_MENU', output),
    3: new Menu(3, 'ROOT_MENU', output),
    4: new Menu(4, 'ROOT_MENU', output),
    5: new Menu(5, 'ROOT_MENU', output),
    6: new Menu(6, 'ROOT_MENU', output),
    7: new Menu(7, 'ROOT_MENU', output),
    8: new Menu(8, 'ROOT_MENU', output),
}

// if (DEBUG) console.log(stripStates);

// MENU SELECTION EVENTS
menuEvents.on('menu_action', (action, stripIndex) => {
    if (action === 'WIN_OUTPUT_MASTER') {
        stripStates[stripIndex] = new WinOutputMaster(stripIndex, null, output);
    }
});

// EVENTS FROM THE SYSTEM DEVICES
deviceEvents.on('system_device_property_changed', (property, device) => {
    if (DEBUG) console.log(device);
});

// EVENTS FROM THE MIDI CONTROLLER TO FORWARD TO THE STRIP HANDLER
midiEvent.on('rotary_turn', (strip, value) => {
    if (DEBUG) console.log('rotary turn - strip:' + strip + ' value:' + value);
    stripStates[strip].handleRotary('turn', value);
});

midiEvent.on('rotary_press', (strip, value) => {
    if (DEBUG) console.log('rotary press - strip:' + strip + ' value:' + value);
    stripStates[strip].handleRotary('press', value);
});

midiEvent.on('fader_move', (strip, value) => {
    if (DEBUG) console.log('fader move - strip:' + strip + ' value:' + value);
    stripStates[strip].handleFader('move', value);
});

midiEvent.on('fader_touch', (strip, value) => {
    if (DEBUG) console.log('fader touch - strip:' + strip + ' value:' + value);
    stripStates[strip].handleFader('touch', value);
});

midiEvent.on('strip_button', (name, strip, value) => {
    if (DEBUG) console.log('strip button - name:' + name + ' strip:' + strip + ' value:' + value);
    stripStates[strip].handleButton(name, value);
});

// GENERAL LCD TICKER PROCESS
setInterval(() => {
    for (const [key, lcdState] of Object.entries(x_touch_set.lcdStates)) {
        if (lcdState == null) continue;

        lcdState.advanceTop(false);
        lcdState.advanceBottom();
        output.sendMessage(x_touch_set.updateLcdWithState(key, lcdState));
    }
}, 300);
