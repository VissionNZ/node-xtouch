// Imports
const hex = require('ascii-hex');
const LcdState = require('./LcdState');

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

// Storage for the current state of an LCD panel, as we'll update the messages every tick,
// and changing lines/colors/invert independently is possible.
var lcdStates = {
    1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null
}

// Lazy instantiation of Lcd states
function initLcd(strip) 
{
    lcdStates[strip] === null 
        ? lcdStates[strip] = new LcdState('off', 'none', '', '') 
        : null;
}

// Takes an LcdState object and creates the update message to send.
// We have to update the whole LCD at once, can't just do line by line or color only. 
// That's why we've got the convenience methods below. 
function updateLcdWithState(strip, state) 
{
    if (!(state instanceof LcdState)) throw "You need to pass an LcdState object!";
    if (strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";

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
function setLcdColor(strip, color) 
{
    if (strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if (!(color in LCD_COLORS)) throw "Invalid LCD color. Options are: red, green, yellow, blue, magenta, cyan, white, or off.";
    
    initLcd(strip);
    
    lcdStates[strip].color = color;

    return updateLcdWithState(strip, lcdStates[strip]);
}

// Convenience to set just the upper text part of the LCD rather than the whole state.
function setLcdTopLine(strip, message, invert) 
{
    if (strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if (!typeof inver === 'boolean') throw "Invalid LCD invert state. Use true or false.";
    
    initLcd(strip);

    lcdStates[strip].topFullText = message;
    
    if (invert && (lcdStates[strip].invert === 'lower')) lcdStates[strip].invert = 'both';
    if (invert && (lcdStates[strip].invert === 'none')) lcdStates[strip].invert = 'upper';
    if (!invert && (lcdStates[strip].invert === 'upper')) lcdStates[strip].invert = 'none';
    if (!invert && (lcdStates[strip].invert === 'both')) lcdStates[strip].invert = 'lower';

    return updateLcdWithState(strip, lcdStates[strip]);
}

// Convenience to set just the bottom text part of the LCD rather than the whole state.
function setLcdBottomLine(strip, message, invert) 
{
    if (strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if (!typeof invert === 'boolean') throw "Invalid LCD invert state. Use true or false.";
    
    initLcd(strip);
    
    lcdStates[strip].bottomFullText = message;
    
    if (invert && (lcdStates[strip].invert === 'upper')) lcdStates[strip].invert = 'both';
    if (invert && (lcdStates[strip].invert === 'none')) lcdStates[strip].invert = 'lower';
    if (!invert && (lcdStates[strip].invert === 'lower')) lcdStates[strip].invert = 'none';
    if (!invert && (lcdStates[strip].invert === 'both')) lcdStates[strip].invert = 'upper';

    return updateLcdWithState(strip, lcdStates[strip]);
}

// Moves the fader to the desired level. Note a level of 100 = 0db on the fader.
function setFader(strip, level) 
{
    if (strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if (level < 0 || strip > 127) throw "Fader level out of bounds (0-127)";

    let message = [176, FADER[strip], level];

    return message;
}

// Sets the button (select, mute, solo or rec) lights on the fader strips appropriately. 
function setStripLight(strip, button, state) 
{
    if (strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if (!(button in STRIP_BUTTON)) throw "Invalid strip button. 'rec', 'solo', 'mute' or 'select' are supported.";
    if (!(state in BUTTON_STATES)) throw "Invalid button state. 'off', 'on' or 'flashing' are supported.";

    let message = [144, STRIP_BUTTON[button] + (strip - 1), BUTTON_STATES[state]];

    return message;
}

// Sets the appropriate audio level LED on the strip. 
// Note this is actually based on 0-127 but this is a convenience method to directly define which LED is operated on.
// Only one LED on at a time possible - restriction of the unit itself :(
function setAudioLevelLed(strip, level) 
{
    if (strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if (level < 0 || level > 8) throw "Level meter LED number out of bounds (0-8)";

    let midi_level = level === 0 ? 0 : Math.round((126 / 8) * level);

    let message = [176, 90 + (strip - 1), midi_level];

    return message;
}

// Note this sets the level internally in the device, but doesn't output the level on setting. 
// Only one LED on at a time possible - restriction of the unit itself :(
function setRotaryLevelLed(strip, level) 
{
    if (strip < 1 || strip > 8) throw "Strip number out of bounds (1-8)";
    if (level < 0 || level > 12) throw "Rotary meter LED number out of bounds (0-8)";

    let relative_level = level === 0 ? 0 : Math.round((126 / 12) * level);

    let message = [176, 80 + (strip - 1), relative_level];

    return message;
}

module.exports = {
    setRotaryLevelLed: setRotaryLevelLed,
    setLcdColor: setLcdColor,
    setLcdTopLine: setLcdTopLine,
    setLcdBottomLine: setLcdBottomLine,
    setAudioLevelLed: setAudioLevelLed,
    setStripLight: setStripLight,
    setFader: setFader,
    updateLcdWithState: updateLcdWithState,
    lcdStates: lcdStates
};