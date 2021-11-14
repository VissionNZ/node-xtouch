const Strip = require('../Strip');
const menuStructure = require('../main_menu.json');
const x_touch_set = require('../x_touch_setters.js');
const LcdState = require('../LcdState');
const Devices = require('../system_devices').Devices;
const deviceEvents = require('../system_devices.js').DeviceEvents;
const SoundMixer = require('native-sound-mixer').default;
const DefaultPlaybackDevice = require('../system_devices').DefaultPlaybackDevice;
const systemDevices = require('../system_devices');

class WinOutputMaster extends Strip {

    constructor(stripIndex, deviceNumber, output) {
        super(stripIndex, 'WIN_OUTPUT_MASTER', output);
        
        this.deviceNumber = deviceNumber == null ? systemDevices.getDeviceNumber(DefaultPlaybackDevice()) : deviceNumber;
        this.currentAdjustMode = 'Vol';
        this.deviceState = Devices[this.deviceNumber];

        this.forceStripRefresh();
        
        // React to system device changes
        deviceEvents.on('system_device_property_changed', (property, device) => {
            if (device == this.deviceNumber) {
                this.updateFromDeviceState();
            } else if (typeof device === 'undefined') {
                this.updateButtons();
            }
        });        
    }

    forceStripRefresh() {
        this.updateFromDeviceState();
    }

    updateFromDeviceState() {
        this.deviceState = Devices[this.deviceNumber];

        this.updateLcd();
        this.updateButtons();
        this.updateFader();
    }

    getVolumeDisplay() {
        return Math.round(Devices[this.deviceNumber].volume * 100);
    }

    getFaderLevel() {
        return Math.round(
            127 * Devices[this.deviceNumber].volume
        );
    }

    midiToDecimal(midiValue) {
        return parseFloat((midiValue / 127).toFixed(1));
    }

    // 65 CW, 1 CCW
    handleRotary(action, value) {
        if (action === 'turn') {
            if (value === 65) {

            } else if (value === 1) {

            }
            
            this.updateLcd();
        } else if (action === 'press') {
            
            if (value === 'on') {
                this.selectTimeMillis = process.hrtime.bigint();
            } else if (value === 'off') {
                if ((process.hrtime.bigint() - this.selectTimeMillis) > 1000000000) {
                    // Long press. 
                } else {
                    // Quick press.
                }      
            }
            
        }
        
    }

    // Go back one level if "REC" is pressed
    handleButton(action, value) {
        if (action === 'mute' && value === 'off') {
            Devices[this.deviceNumber].mute = !this.deviceState.mute;

            this.output.sendMessage(
                x_touch_set.setStripLight(this.stripIndex, 'mute', this.deviceState.mute ? 'on' : 'off')
            );
        } else if (action === 'select' && value === 'off') {
            console.log('Not supported. Setting default device not allowed.');
        }
    }

    handleFader(action, value) {
        if (action === 'move') {
            Devices[this.deviceNumber].volume = this.midiToDecimal(value); 
        } else if (action === 'touch') {
            
        }
    }

    updateButtons()
    {
        this.output.sendMessage(
            x_touch_set.setStripLight(this.stripIndex, 'mute', this.deviceState.mute ? 'on' : 'off')
        );

        this.output.sendMessage(
            x_touch_set.setStripLight(
                this.stripIndex, 'select',
                Devices[this.deviceNumber].name == DefaultPlaybackDevice().name ? 'on' : 'flash'
            )
        );
    }

    updateFader()
    {
        this.output.sendMessage(
            x_touch_set.setFader(this.stripIndex, this.getFaderLevel())
        );
    }

    updateLcd()
    {
        x_touch_set.lcdStates[this.stripIndex] = new LcdState(
            'blue', 
            'upper', 
            this.deviceState.name,
            this.currentAdjustMode + ': ' + this.getVolumeDisplay()
        );
    }

}

module.exports = WinOutputMaster;