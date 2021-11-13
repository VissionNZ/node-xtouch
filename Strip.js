class Strip {

    constructor(stripIndex, type, output) {
        this.stripIndex = stripIndex;
        this.output = output;

        if (this.validType(type)) {
            this.type = type
        } else if (typeof type === 'undefined') {
            this.type = "ROOT_MENU";
        } else {
            process.exit();
        }
    }

    VALID_TYPES = [
        'ROOT_MENU',
        'VM_OUTPUT_SELECT',
        'VM_OUTPUT',
        'VM_INPUT_SELECT',
        'VM_INPUT',
        'WIN_INPUT_SELECT',
        'WIN_INPUT_DEVICE',
        'WIN_OUTPUT_SELECT_DEVICE',
        'WIN_OUTPUT_SELECT_SESSION',
        'WIN_OUTPUT_SESSION',
        'WIN_OUTPUT_DEVICE',
        'WIN_OUTPUT_MASTER'
    ]; 

    validType(type) 
    {
        return this.VALID_TYPES.indexOf(type) == -1 ? false : true;
    }

    handleRotary(action, value)
    {
        console.log(this.stripIndex + '  rotary does not have an action handler.');
    }

    handleFader(action, value)
    {
        console.log(this.stripIndex + ' fader does not have an action handler.');
    }

    handleButton(name, value)
    {
        console.log(this.stripIndex + ' button does not have an action handler.');
    }

    updateLcd()
    {
        console.log(this.stripIndex + ' lcd does not have a state assigned.');
    }

    forceStripRefresh()
    {
        console.log('forceStripRefresh not implemented');
    }
}

module.exports = Strip;