const OBSWebSocket = require ('obs-websocket-js');
const Midi = require('midi');
const hex = require('ascii-hex');
const obs = new OBSWebSocket();

obs.on('error', err => {
    console.error('socket error:', err);
});


// obs.connect({ address: 'localhost:4444', passsword: 'Test123' })
// .then(() => {
//     obs.send('GetStats')
//     .then((data) => {
//         console.log(data);
//     });
// })
// .catch(err => { // Promise convention dicates you have a catch on every chain.
//     console.log(err);
// });

// Set up a new input.
const input = new Midi.Input();

// Count the available input ports.
console.log(`count: ${input.getPortCount()}`);

console.log(`portname: ${input.getPortName(0)}`);

input.openPort(0);
input.ignoreTypes(true, false, false);

// Configure a callback.
input.on('message', (deltaTime, message) => {
    // The message is an array of numbers corresponding to the MIDI bytes:
    //   [status, data1, data2]
    // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
    // information interpreting the messages.
    console.log(`m: ${message} d: ${deltaTime}`);
  });

const output = new Midi.output();
output.openPort(0);

let message = 'what!'.split('').map((letter, index) => {
    console.log(letter);
    return hex(letter);
});
console.log(message);

message.unshift(0xF0, 0x00, 0x20, 0x32, 0x15, 0x4C, 0x01, 0x01);
message.push(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF7);

console.log(message);

output.sendMessage(message);

// Level meter (ch1, CC, val)
output.sendMessage([176, 90, 0]);
// Fader move
output.sendMessage([176, 70, 50]);
// Ring set
output.sendMessage([176, 80, 50]);
// Button flash (ch1, note#, vel)
output.sendMessage([144, 8, 64]);
// Button steady (ch1, note#, vel)
output.sendMessage([144, 16, 100]); // solo
output.sendMessage([144, 24, 77]); // mute
output.sendMessage([144, 32, 64]); // select