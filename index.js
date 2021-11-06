const midiEvent = require('./x_touch_events.js').midiEvent;
const initEvents = require('./x_touch_events.js').init;
const x_touch_set = require('./x_touch_setters.js');
const LcdState = require('./LcdState');
const prompt = require('prompt-sync')({sigint: true});
const MenuStrip = require('./strip-states/MenuStrip');

const DEBUG = false;

// Our sound mixer instance.
const SoundMixer = require('native-sound-mixer').default;

// Sound mixer constants
const DeviceType = require('native-sound-mixer').DeviceType;
const AudioSessionState = require('native-sound-mixer').AudioSessionState;

// SETTING THE INTERFACE DEVICE
const Midi = require('midi');

const input = new Midi.input();
const output = new Midi.output();

const inputPortCount = input.getPortCount();
const outputPortCount = output.getPortCount();

var inputPortNames = [];
var outputPortNames = [];

const stripStates = {
    1: new MenuStrip(1, 'ROOT_MENU'),
    2: new MenuStrip(2, 'ROOT_MENU'),
    3: new MenuStrip(3, 'ROOT_MENU'),
    4: new MenuStrip(4, 'ROOT_MENU'),
    5: new MenuStrip(5, 'ROOT_MENU'),
    6: new MenuStrip(6, 'ROOT_MENU'),
    7: new MenuStrip(7, 'ROOT_MENU'),
    8: new MenuStrip(8, 'ROOT_MENU'),
}

for (let port = 0; port < inputPortCount; port ++) {
    let inputPortName = output.getPortName(port);
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
}

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
}

output.openPort(outputPortSelectionInteger);
input.openPort(inputPortSelectionInteger);
initEvents(outputPortSelectionInteger);

if (DEBUG) console.log(stripStates);

// EVENTS FROM THE DEVICE TO FORWARD TO THE STRIP HANDLER
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
    stripStates[strip].handleFader('press', value);
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
