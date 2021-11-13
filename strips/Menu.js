const Strip = require("../Strip");
const menuStructure = require('../main_menu.json');
const x_touch_set = require('../x_touch_setters.js');
const LcdState = require('../LcdState');

class Menu extends Strip {

    constructor(stripIndex, type) {
        super(stripIndex, type);

        this.currentMenu = 'root';
        this.currentOption = 0;

        this.updateOptionsInGroup();
    }

    // 65 CW, 1 CCW
    handleRotary(action, value) {
        if (action === 'turn') {
            if (value === 65 && this.currentOption + 1 < this.numberOfMenuOptions) this.currentOption++;
            if (value === 1 && this.currentOption > 0) this.currentOption--;
            
            this.updateLcd();
        } else if (action === 'press') {
            
            if (value === 'on') {
                this.selectTimeMillis = process.hrtime.bigint();
            } else if (value === 'off') {
                // Allow a 200 ms delay before actioning to avoid accidental presses. 
                if ((process.hrtime.bigint() - this.selectTimeMillis) > 200000000) {
                    let nextMenu = menuStructure[this.currentMenu][this.currentOption]['next'];
                    
                    let splitOption = nextMenu.split(':');
                    
                    if (typeof splitOption[1] !== 'undefined') {
                        console.log("TAKE ACTION: " + splitOption[1]);
                    } else {
                        this.currentMenu = nextMenu;
                        this.updateOptionsInGroup();
                        this.updateLcd();
                    }

                    this.currentOption = 0;
                } else {
                    console.log('Too quick');
                }
                
            }
            
        }
        
    }

    // Go back one level if "REC" is pressed
    handleButton(action, value) {
        if (action === 'rec') {
            
            if (value === 'on') {
                this.selectTimeMillis = process.hrtime.bigint();
            } else if (value === 'off') {
                if ((process.hrtime.bigint() - this.selectTimeMillis) > 200000000) {
                    this.currentMenu = menuStructure[this.currentMenu][this.currentOption]['prev'];
                    this.currentOption = 0;
                    
                    this.updateOptionsInGroup();
                    this.updateLcd();
                } else {
                    console.log('Too quick');
                }
            }
            
        }
    }

    updateLcd()
    {
        x_touch_set.lcdStates[this.stripIndex] = new LcdState(
            'red', 
            'upper', 
            menuStructure[this.currentMenu][this.currentOption]['lcd_line_1'], 
            menuStructure[this.currentMenu][this.currentOption]['lcd_line_2']
        );
    }

    updateOptionsInGroup()
    {
        this.numberOfMenuOptions = Object.keys(menuStructure[this.currentMenu]).length;
    }

}

module.exports = Menu;