const midiEvent = require('./x_touch_events.js').midiEvent;
const initEvents = require('./x_touch_events.js').init;
const x_touch_set = require('./x_touch_setters.js');
const LcdState = require('./LcdState');
const prompt = require('prompt-sync')({sigint: true});

// SETTING THE INTERFACE DEVICE
const Midi = require('midi');

const input = new Midi.input();
const output = new Midi.output();

const inputPortCount = input.getPortCount();
const outputPortCount = output.getPortCount();

// INPUT DEVICE SELECTION - E.G. MIDI CONTROLLER ADJUSTS VOLUME
for (let port = 0; port < inputPortCount; port ++) {
    let inputPortName = input.getPortName(port);

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

// Fader setting test
output.sendMessage(x_touch_set.setFader(1, 20));
output.sendMessage(x_touch_set.setFader(2, 100));
output.sendMessage(x_touch_set.setFader(3, 127));
output.sendMessage(x_touch_set.setFader(4, 50));
output.sendMessage(x_touch_set.setFader(5, 66));
output.sendMessage(x_touch_set.setFader(6, 5));
output.sendMessage(x_touch_set.setFader(7, 110));
output.sendMessage(x_touch_set.setFader(8, 79));

// Strip light setting test.
output.sendMessage(x_touch_set.setStripLight(3, 'rec', 'flash'));
output.sendMessage(x_touch_set.setStripLight(5, 'select', 'on'));
output.sendMessage(x_touch_set.setStripLight(1, 'mute', 'off'));
output.sendMessage(x_touch_set.setStripLight(2, 'mute', 'on'));
output.sendMessage(x_touch_set.setStripLight(4, 'solo', 'on'));
output.sendMessage(x_touch_set.setStripLight(1, 'rec', 'on'));
output.sendMessage(x_touch_set.setStripLight(6, 'select', 'flash'));
output.sendMessage(x_touch_set.setStripLight(7, 'solo', 'flash'));

// Audio level LED set test
output.sendMessage(x_touch_set.setAudioLevelLed(1, 1));
output.sendMessage(x_touch_set.setAudioLevelLed(2, 2));
output.sendMessage(x_touch_set.setAudioLevelLed(3, 3));
output.sendMessage(x_touch_set.setAudioLevelLed(4, 4));
output.sendMessage(x_touch_set.setAudioLevelLed(5, 5));
output.sendMessage(x_touch_set.setAudioLevelLed(6, 6));
output.sendMessage(x_touch_set.setAudioLevelLed(7, 7));
output.sendMessage(x_touch_set.setAudioLevelLed(8, 8));

// Rotary level LED set test
output.sendMessage(x_touch_set.setRotaryLevelLed(1, 9));
output.sendMessage(x_touch_set.setRotaryLevelLed(2, 10));
output.sendMessage(x_touch_set.setRotaryLevelLed(3, 11));
output.sendMessage(x_touch_set.setRotaryLevelLed(4, 12));
output.sendMessage(x_touch_set.setRotaryLevelLed(5, 5));
output.sendMessage(x_touch_set.setRotaryLevelLed(6, 6));
output.sendMessage(x_touch_set.setRotaryLevelLed(7, 7));
output.sendMessage(x_touch_set.setRotaryLevelLed(8, 8));

// Test LCD update
x_touch_set.lcdStates[1] = new LcdState('red', 'upper', 'Kind of long.', 'And another.');
x_touch_set.lcdStates[2] = new LcdState('magenta', 'both', 'Kind of long.', 'And another.');
x_touch_set.lcdStates[4] = new LcdState('green', 'none', 'Kind of long.', 'And another.');
x_touch_set.lcdStates[3] = new LcdState('blue', 'upper', 'Kind of long.', 'And another.');
x_touch_set.lcdStates[5] = new LcdState('white', 'both', 'Kind of long.', 'And another.');
x_touch_set.lcdStates[6] = new LcdState('cyan', 'both', 'Kind of long.', 'And another.');
x_touch_set.lcdStates[8] = new LcdState('yellow', 'lower', 'Kind of long.', 'And another.');

x_touch_set.setLcdBottomLine(7, 'This is a test message', true);
x_touch_set.setLcdTopLine(7, 'This is a test message', true);
x_touch_set.setLcdColor(7, 'green');
