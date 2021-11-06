const Strip = require("../Strip");
const menuStructure = require('../main_menu.json');
const x_touch_set = require('../x_touch_setters.js');
const LcdState = require('../LcdState');

class MenuStrip extends Strip {

    constructor(stripIndex, type) {
        super(stripIndex, type);

        this.currentMenu = 'root';
        this.currentOption = 0;

        this.updateOptionsInGroup();
    }

    // 65 CW, 1 CCW
    handleRotary(action, value) {
        // console.log(menuStructure[this.currentMenu]);
        console.log(value);
        console.log(this.numberOfMenuOptions);
        console.log(this.currentOption);

        if (action === 'turn') {
            if (value === 65 && this.currentOption + 1 < this.numberOfMenuOptions) this.currentOption++;
            if (value === 1 && this.currentOption > 0) this.currentOption--;

            x_touch_set.lcdStates[this.stripIndex] = new LcdState(
                'red', 
                'upper', 
                menuStructure[this.currentMenu][this.currentOption]['lcd_line_1'], 
                menuStructure[this.currentMenu][this.currentOption]['lcd_line_2']
            );

        } else if (action === 'press') {
            if (value === 'on') {
                this.selectTimeMillis = process.hrtime.bigint();
            } else if (value === 'off') {
                if ((process.hrtime.bigint() - this.selectTimeMillis) > 200000000) { // 200ms
                    console.log('selected');
                } else {
                    console.log('Too quick');
                }
            }
        }

    }

    updateOptionsInGroup()
    {
        this.numberOfMenuOptions = Object.keys(menuStructure[this.currentMenu]).length;
    }

}

module.exports = MenuStrip;