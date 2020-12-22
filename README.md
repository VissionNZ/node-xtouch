# node-xtouch
Behringer X Touch Extender NodeJS interface.

## Status and plans
In active development. Following features are planned for "V1.0.0" where I will be releasing as an includable package on npm.

- Build simple node functions mapping to all the x-touch extender features (bidirectional) (**DONE! v0.2.0**).
    - Fader levels (**done**)
    - Buttons (on/flashing/off) (**done**)
    - Audio meter level set (**done**)
    - Scribble strips with scrolling text (**done**)
    - Rotary (**done**)

- Build a "menu" API of sorts, for building and navigating different menu structures on the X-Touch Extender and binding to certain events. Probably JSON structure. (v0.3.0)

### OBS-websocket integration
Idea is to control OBS studio's main features via the X-Touch Extender.
- Map each audio source in OBS to a slider
    - Cycle through monitor/monitor&output/output modes
    - Mute/unmute
    - Volume
    - Scribble strip name and volume

- One slider dedicated to studio mode
    - Press to cut
    - Slide to fade
    - Scribble strip status
    - Select monitor scene with rotary knob

- Future
    - Audio filter adjustments
    - Streaming controls
    - Video filters?
### Future
- If someone wants to buy me the full x-touch unit I'll integrate that?
- Split project out
    - node-xtouch module is a separate abstraction, with menu layers, event firing etc. Ability to use anywhere. 
- Integration for VoiceMeeter
- Integration for ???
- Easier installation and use, web GUI.
    
## Installation
### Requirements
- Uses [node-midi](https://github.com/justinlatimer/node-midi) package, which requires at least Python 2.7.2 installed and included in the system path variable.
- Also requires a C++ compiler - don't worry it's not that hard! [Visual Studio Community](https://visualstudio.microsoft.com/vs/community/), XCode (Mac Build Tools), or the multitude of Linux ones.
- Your Linux distro needs ALSA to be installed and configured, and the libasound2-dev package.

### Installation and Use
- Make sure your system is set up
    - Python >2.7.2 (in system PATH)
    - C++ compiler (in system PATH)
    - NodeJS installed (npm/node in system PATH)
- Download and extract, or clone the repo to where you want to 'install it'
    - ```git clone https://github.com/VissionNZ/node-xtouch.git```
- To test, run ```node x_touch_testers.js``` in the install directory with the X-Touch Extender plugged in. If things move/light up wohoo! Try moving/pushing some stuff.
- Start developing!
    - See the [wiki](https://github.com/VissionNZ/node-xtouch/wiki) for more details on the current API.
    - **x_touch_events.js** : fires all the various events from the unit.
    - **x_touch_setters.js** : methods to set all the options on the unit.
    - **LcdState.js** : Just the LcdState class which keeps a track of each LCD screen, and has some methods you can call:
        - advanceTop/Bottom(bool forwards) : moves the message on the top or bottom of the LCD forward or back one character. 
        - advance() : moves the messages on the top and bottom forward one character.
