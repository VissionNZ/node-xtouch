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
