const midiEvent = require('./x_touch_events.js');
const x_touch_set = require('./x_touch_setters.js');
const LcdState = require('./LcdState');
const prompt = require('prompt-sync')({sigint: true});

// EVENTS FROM THE DEVICE
midiEvent.on('rotary_turn', (strip, value) => {
    console.log('rotary turn - strip:' + strip + ' value:' + value);
});
midiEvent.on('rotary_press', (strip, value) => {
    console.log('rotary press - strip:' + strip + ' value:' + value);
});
midiEvent.on('fader_move', (strip, value) => {
    console.log('fader move - strip:' + strip + ' value:' + value);
});
midiEvent.on('fader_touch', (strip, value) => {
    console.log('fader touch - strip:' + strip + ' value:' + value);
});
midiEvent.on('strip_button', (name, strip, value) => {
    console.log('strip button - name:' + name + ' strip:' + strip + ' value:' + value);
});

// SETTING THE DEVICE
const Midi = require('midi');

const input = new Midi.input();
const output = new Midi.output();

const inputPortCount = input.getPortCount();
const outputPortCount = output.getPortCount();

var inputPortNames = [];
var outputPortNames = [];

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

setInterval(() => {
    for(const [key, lcdState] of Object.entries(x_touch_set.lcdStates)) {
        if(lcdState == null) continue;
        lcdState.advanceTop(false);
        lcdState.advanceBottom();
        output.sendMessage(x_touch_set.updateLcdWithState(key, lcdState));
    }
}, 300);
