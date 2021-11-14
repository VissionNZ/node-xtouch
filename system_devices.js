// Our sound mixer instance.
const SoundMixer = require('native-sound-mixer').default;
const EventEmitter = require('events');

// Sound mixer constants
const DeviceType = require('native-sound-mixer').DeviceType;
const AudioSessionState = require('native-sound-mixer').AudioSessionState; // Doesn't look like this is implemented.

// console.log(DeviceType); // RENDER (0) or CAPTURE (1)
// console.log(AudioSessionState); // '0': 'ACTIVE', '1': 'INACTIVE', '2': 'EXPIRED'
// console.log(SoundMixer.devices);

class DeviceEvent extends EventEmitter {}
const DeviceEvents = new DeviceEvent();

var defaultPlaybackDevice = SoundMixer.getDefaultDevice(0);
var defaultCaptureDevice = SoundMixer.getDefaultDevice(1);

// console.log(defaultPlaybackDevice); // Default playback device
// console.log(defaultCaptureDevice); // Default record device
// console.log(defaultPlaybackDevice.sessions[0]); // Default playback device sessions

var lastPolled = 0;
var currentDeviceStates = {};

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function updateLastPolled()
{
  lastPolled = process.hrtime.bigint();
}

function getLastPolled()
{
  return lastPolled;
}

function populateDeviceStates()
{
  for (const device in SoundMixer.devices) {
    currentDeviceStates[device] = {
      volume: SoundMixer.devices[device].volume,
      name: SoundMixer.devices[device].name,
      mute: SoundMixer.devices[device].mute,
      left: SoundMixer.devices[device].balance.left,
      right: SoundMixer.devices[device].balance.right,
    };
  }
}

function checkSessionState(device, session)
{

}

function getDeviceNumber(deviceToFind)
{
  var result = -1;

  SoundMixer.devices.forEach((device, index) => {
    if (device.name == deviceToFind.name && device.type == deviceToFind.type) {
      result = index;
    }
  });

  return result;
}

function checkDeviceState(device)
{
  // PLAYBACK
  if (currentDeviceStates[device].name != SoundMixer.devices[device].name) {
    // Name changed
    populateDeviceStates();
    DeviceEvents.emit('system_device_property_changed', 'name', device);
  }

  if (round(currentDeviceStates[device].volume, 1) != round(SoundMixer.devices[device].volume, 1)) {
    // Volume changed
    populateDeviceStates();
    DeviceEvents.emit('system_device_property_changed', 'volume', device);
  }

  if (currentDeviceStates[device].mute != SoundMixer.devices[device].mute) {
    // Mute changed
    populateDeviceStates();
    DeviceEvents.emit('system_device_property_changed', 'mute', device);
  }

  if (
    (currentDeviceStates[device].left != SoundMixer.devices[device].balance.left)
    || (currentDeviceStates[device].right != SoundMixer.devices[device].balance.right)
  ) {
    // Balance changed
    populateDeviceStates();
    DeviceEvents.emit('system_device_property_changed', 'balance', device);
  }

  // RECORDING
}

// POLL DEVICES
function poll() {
  updateLastPolled();

  for (const device in SoundMixer.devices) {
    checkDeviceState(device);
  }  
    
  // DEFAULT PLAYBACK DEVICE CHANGED
  if (defaultPlaybackDevice.name != SoundMixer.getDefaultDevice(0).name) {
    console.log('default playback device changed');
    DeviceEvents.emit('system_device_property_changed', 'default_playback');
    defaultPlaybackDevice = SoundMixer.getDefaultDevice(0);
  }

  // DEFAULT CAPTURE DEVICE CHANGED
  if (defaultCaptureDevice.name != SoundMixer.getDefaultDevice(1).name) {
    console.log('default capture device changed');
    DeviceEvents.emit('system_device_property_changed', 'default_record');
    defaultCaptureDevice = SoundMixer.getDefaultDevice(1);
  }

}  

// Start polling
populateDeviceStates();
const pollInterval = setInterval(poll, 500);

// Exports
module.exports = {
  Devices: SoundMixer.devices,
  DefaultPlaybackDevice: () => SoundMixer.getDefaultDevice(0),
  DefaultRecordingDevice: () => SoundMixer.getDefaultDevice(1),
  DeviceEvents: DeviceEvents,
  getLastPolled: getLastPolled(),
  getDeviceNumber: getDeviceNumber
}


// JUST SOME DATA REFERENCE

// AUDIO SESSIONS
/*
[
  AudioSession {
    name: 'Discord',
    appName: 'C:\\Users\\Stef\\AppData\\Local\\Discord\\app-1.0.9003\\Discord.exe'
  },
  AudioSession { name: '', appName: '' }, // This is likely to be System Sounds
  AudioSession {
    name: 'steam',
    appName: 'D:\\Software\\Steam\\steam.exe'
  },
  AudioSession {
    name: 'Discord',
    appName: 'C:\\Users\\Stef\\AppData\\Local\\Discord\\app-1.0.9003\\Discord.exe'
  }
]
*/

// DEVICES
/*
[
  Device { 
      name: '27G3G3- (NVIDIA High Definition Audio)', 
      type: 0 
  },
  Device {
    name: 'Speakers (Mixing Driver 2 for US-2x2 & US-4x4)',
    type: 0
  }
]
*/
