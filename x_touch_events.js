// Imports
const hex = require('ascii-hex');
const Midi = require('midi');
const EventEmitter = require('events');
const input = new Midi.Input();

class MidiEvent extends EventEmitter {}
const midiEvent = new MidiEvent();

// Define constants
const FADER = {
    1: 70, 2: 71, 3: 72, 4: 73, 5: 74, 6: 75, 7: 76, 8: 77
};
const FADER_TOUCH = {
    1: 110, 2: 111, 3: 112, 4: 113, 5: 114, 6: 115, 7: 116, 8: 117
};
const ROTARY = {
    1: 80, 2: 81, 3: 82, 4: 83, 5: 84, 6: 85, 7: 86, 8: 87
};
const ROTARY_BUTTON = {
    1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7
}
const STRIP_BUTTON = {
    'rec': 8, 'solo': 16, 'mute': 24, 'select': 32
};

// Helper function
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

// Set up a new input.
input.openPort(0);
input.ignoreTypes(true, false, false);

// Receive midi message and pass to appropriate handler.
input.on('message', (deltaTime, message) => {
    // CC's
    if (message[0] == 176) { 
        if (Object.values(ROTARY).indexOf(message[1]) !== -1) 
            rotary(message, false, deltaTime);
        if (Object.values(FADER).indexOf(message[1]) !== -1) 
            fader(message, false, deltaTime);
    }

    // Notes
    if (message[0] == 144) {
        if (Object.values(ROTARY_BUTTON).indexOf(message[1]) !== -1) 
            rotary(message, true, deltaTime);

        if (Object.values(FADER_TOUCH).indexOf(message[1]) !== -1) 
            fader(message, true, deltaTime);

        if (message[1] >= 8 && message[1] <= 39) 
            button(message, deltaTime);
    }
});

function rotary(message, pressed, delta) 
{
    if (pressed && message[2] === 127) 
        midiEvent.emit('rotary_press', getKeyByValue(ROTARY_BUTTON, message[1]), 'on');

    if (pressed && message[2] === 0) 
        midiEvent.emit('rotary_press', getKeyByValue(ROTARY_BUTTON, message[1]), 'off');

    if (!pressed) 
        midiEvent.emit('rotary_turn', getKeyByValue(ROTARY, message[1]), message[2], delta);
}

function fader(message, touch, delta) 
{
    if (touch && message[2] === 127) 
        midiEvent.emit('fader_touch', getKeyByValue(FADER_TOUCH, message[1]), 'on');

    if (touch && message[2] === 0) 
        midiEvent.emit('fader_touch', getKeyByValue(FADER_TOUCH, message[1]), 'off');

    if (!touch) 
        midiEvent.emit('fader_move', getKeyByValue(FADER, message[1]), message[2], delta);
}

function button(message, delta) 
{
    let buttonName = '';
    let strip = 0;

    if (message[1] >= 8 && message[1] <= 15) {
        buttonName = 'rec';
        strip = message[1] - 7;
    } else if (message[1] >= 16 && message[1] <= 23) {
        buttonName = 'solo';
        strip = message[1] - 15;
    } else if (message[1] >= 24 && message[1] <= 31) {
        buttonName = 'mute';
        strip = message[1] - 23;
    } else if (message[1] >= 32 && message[1] <= 39) {
        buttonName = 'select';
        strip = message[1] - 31;
    }

    midiEvent.emit('strip_button', buttonName, strip, message[2] === 127 ? 'on' : 'off', delta);
}

module.exports = midiEvent;