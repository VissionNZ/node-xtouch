// Imports
const hex = require('ascii-hex');

// Define constants
const FADER = {
    1: 70, 2: 71, 3: 72, 4: 73, 5: 74, 6: 75, 7: 76, 8: 77
};
const STRIP_BUTTON = {
    'rec': 8, 'solo': 16, 'mute': 24, 'select': 32
};
const BUTTON_STATES = {
    'off': 0, 'on': 126, 'flash': 64
}
const LCD_COLORS = {
    'off': 0, 'red': 1, 'green': 2, 'yellow': 3, 'blue': 4, 'magenta': 5, 'cyan': 6, 'white': 7
}
// Which line has a dark background.
const LCD_INVERT = {
    'both': 0, 'lower': 1, 'upper': 2, 'none': 3
}

// For scrolling LCD lines, determines how many advance ticks 
// it will pause at the start of the string before scrolling.
const PAUSE_TICK = 3;

class LcdState {
    // Scroll delta is float between 0 and 1. 
    constructor(color, invert, topFullText, bottomFullText) {
        this.color = color;
        this.invert = invert;
        this.topLine = topFullText;
        this.bottomLine = bottomFullText;
        this.scrollOffsetTop = 0;
        this.scrollOffsetBottom = 0;
    }

    get topSevenChars() {
        if(this.topLine.length <= 7) return this.topLine.padEnd(7);
        let topLinePadded = this.topLine + '   ' + this.topLine.substring(0, 7);
        return topLinePadded.substring(this.scrollOffsetTop, this.scrollOffsetTop + 7);
    }

    get bottomSevenChars() {
        if(this.bottomLine.length <= 7) return this.bottomLine.padEnd(7);
        let bottomLinePadded = this.bottomLine + '   ' + this.bottomLine.substring(0, 7);
        return bottomLinePadded.substring(this.scrollOffsetBottom, this.scrollOffsetBottom + 7);
    }

    // TODO: implement PAUSE_TICK
    advanceTop(forwards = true) {
        if(forwards) this.scrollOffsetTop = this.scrollOffsetTop == this.topLine.length + 2 ? 0 : this.scrollOffsetTop + 1;
        if(!forwards) this.scrollOffsetTop = this.scrollOffsetTop == 0 ? this.topLine.length + 5 : this.scrollOffsetTop - 1;
    }

    advanceBottom(forwards = true) {
        if(forwards) this.scrollOffsetBottom = this.scrollOffsetBottom == this.bottomLine.length + 2 ? 0 : this.scrollOffsetBottom + 1;
        if(!forwards) this.scrollOffsetBottom = this.scrollOffsetBottom == 0 ? this.bottomLine.length + 2 : this.scrollOffsetBottom - 1;
    }

}

// Storage for the current state of an LCD panel, as we'll update the messages every tick,
// and changing lines/colors/invert independently is possible.
var lcdStates = {
    1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null
}

// Lazy instantiation of Lcd states
function initLcd(strip) {
    lcdStates[strip] === null ? lcdStates[strip] = new LcdState(0, null, null, null) : null;
}

// Takes an LcdState object and creates the update message to send.
// We have to update the whole LCD at once, can't just do line by line or color only. 
// That's why we've got the convenience methods below. 
function updateLcdWithState(strip, state) {
    if(!(state instanceof LcdState)) throw "You need to pass an LcdState object!";
    if(strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";

    // SysEx header with device id 15 for x-touch extender (not 42 like the manual said...)
    let header = [0xF0, 0x00, 0x20, 0x32, 0x15, 0x4C];
    // Close SysEx
    let close = 0xF7;

    let color = parseInt(`0x${LCD_INVERT[state.invert]}${LCD_COLORS[state.color]}`);

    let topText = state.topSevenChars.split('').map((letter) => { return hex(letter); });
    let bottomText = state.bottomSevenChars.split('').map((letter) => { return hex(letter); });

    return header.concat(strip - 1, color, topText, bottomText, close);
}

// Convenience to set just the color part of the LCD rather than the whole state.
function setLcdColor(strip, color) {
    if(strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if(!(color in LCD_COLORS)) throw "Invalid LCD color. Options are: red, green, yellow, blue, magenta, cyan, white, or off.";
    initLcd(strip);
}

// Convenience to set just the upper text part of the LCD rather than the whole state.
function setLcdTopLine(strip, message, invert) {
    if(strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    initLcd(strip);
    lcdStates[strip].topFullText = message;
}

// Convenience to set just the bottom text part of the LCD rather than the whole state.
function setLcdBottomLine(strip, message, invert) {
    if(strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    initLcd(strip);
}

// Moves the fader to the desired level. Note a level of 100 = 0db on the fader.
function setFader(strip, level) {
    if(strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if(level < 0 || strip > 127) throw "Fader level out of bounds (0-127)";

    let message = [176, FADER[strip], level];

    return message;
}

// Sets the button (select, mute, solo or rec) lights on the fader strips appropriately. 
function setStripLight(strip, button, state) {
    if(strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if(!(button in STRIP_BUTTON)) throw "Invalid strip button. 'rec', 'solo', 'mute' or 'select' are supported.";
    if(!(state in BUTTON_STATES)) throw "Invalid button state. 'off', 'on' or 'flashing' are supported.";

    let message = [144, STRIP_BUTTON[button] + (strip - 1), BUTTON_STATES[state]];

    return message;
}

// Sets the appropriate audio level LED on the strip. 
// Note this is actually based on 0-127 but this is a convenience method to directly define which LED is operated on.
// Only one LED on at a time possible - restriction of the unit itself :(
function setAudioLevelLed(strip, level) {
    if(strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if(level < 0 || level > 8) throw "Level meter LED number out of bounds (0-8)";

    let midi_level = level === 0 ? 0 : Math.round((126 / 8) * level);

    let message = [176, 90 + (strip - 1), midi_level];

    return message;
}

// Note this sets the level internally in the device, but doesn't output the level on setting. 
// Only one LED on at a time possible - restriction of the unit itself :(
function setRotaryLevelLed(strip, level) {
    if(strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if(level < 0 || level > 12) throw "Rotary meter LED number out of bounds (0-8)";

    let relative_level = level === 0 ? 0 : Math.round((126 / 12) * level);

    let message = [176, 80 + (strip - 1), relative_level];

    return message;
}

const OBSWebSocket = require ('obs-websocket-js');
const Midi = require('midi');
const obs = new OBSWebSocket();

obs.on('error', err => {
    console.error('socket error:', err);
});


// Set up a new input.
const input = new Midi.Input();

input.openPort(0);
input.ignoreTypes(true, false, false);

// Configure a callback.
input.on('message', (deltaTime, message) => {
    console.log(`m: ${message} d: ${deltaTime}`);
  });

const output = new Midi.output();
output.openPort(0);






// Fader setting test
output.sendMessage(setFader(1, 20));
output.sendMessage(setFader(2, 100));
output.sendMessage(setFader(3, 127));
output.sendMessage(setFader(4, 50));
output.sendMessage(setFader(5, 66));
output.sendMessage(setFader(6, 5));
output.sendMessage(setFader(7, 110));
output.sendMessage(setFader(8, 79));

// Strip light setting test.
output.sendMessage(setStripLight(3, 'rec', 'flash'));
output.sendMessage(setStripLight(5, 'select', 'on'));
output.sendMessage(setStripLight(1, 'mute', 'off'));

// Audio level LED set test
output.sendMessage(setAudioLevelLed(1, 1));
output.sendMessage(setAudioLevelLed(2, 2));
output.sendMessage(setAudioLevelLed(3, 3));
output.sendMessage(setAudioLevelLed(4, 4));
output.sendMessage(setAudioLevelLed(5, 5));
output.sendMessage(setAudioLevelLed(6, 6));
output.sendMessage(setAudioLevelLed(7, 7));
output.sendMessage(setAudioLevelLed(8, 8));

// Rotary level LED set test
output.sendMessage(setRotaryLevelLed(1, 9));
output.sendMessage(setRotaryLevelLed(2, 10));
output.sendMessage(setRotaryLevelLed(3, 11));
output.sendMessage(setRotaryLevelLed(4, 12));
output.sendMessage(setRotaryLevelLed(5, 5));
output.sendMessage(setRotaryLevelLed(6, 6));
output.sendMessage(setRotaryLevelLed(7, 7));
output.sendMessage(setRotaryLevelLed(8, 8));

// Test LCD update
var state = new LcdState('magenta', 'upper', 'Kind of long.', 'And another.');
var state2 = new LcdState('blue', 'upper', 'Kind of long.', 'And another.');
var state3 = new LcdState('yellow', 'lower', 'Kind of long.', 'And another.');
setInterval(() => {
    state.advanceTop();
    state.advanceBottom(false);
    output.sendMessage(updateLcdWithState(6, state));
    output.sendMessage(updateLcdWithState(8, state2));
    output.sendMessage(updateLcdWithState(2, state3));
}, 300);
