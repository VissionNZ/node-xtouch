# node-xtouch
OBS-websocket based Behringer x-touch-extender interface for OBS studio.

## Status and plans (1st half 2020)
In active development. Just started! Following features are planned for "V1.0.0"
- Build simple node functions mapping to all the x-touch extender features.
    - Fader levels in/out
    - Buttons (on/flashing/off), pressed outputs
    - Audio meter level set
    - Scribble strips with scrolling text
    - Rotary in/out

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

### Future (2nd half 2021)
- Audio filter adjustments
- Streaming controls
- Video filters?
- If someone wants to buy me the full x-touch unit I'll integrate that?
## Installation
### Requirements
- Uses node-midi package, which requires at least Python 2.7.2 installed and included in the system path variable.
- Also requires a C++ compiler - don't worry it's not that hard! Visual Studio Express, XCode, or any of the Linux ones.
- Linux also requires ALSA to be installed and configured, and the libasound2-dev package.

### Method
- TBC!
