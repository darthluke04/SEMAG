/* By Morgan McGuire @CasualEffects https://casual-effects.com LGPL 3.0 License */

// Web software host implementation of the runtime back end for quadplay. This
// contains all of the routines that are browser specific for the runtime and
// could be replaced with a node.js or native version.

"use strict";

/**
   Global arrays for abstracting hardware memory copies of spritesheet
   and font data. Indices into these are is used as "pointers" when
   communicating with the virtual GPU. These are mapped to
   QRuntime.$spritesheetArray and QRuntime.$fontArray. Each asset has
   a _index[0] field describing its index in this array.
*/
let spritesheetArray = [];
let fontArray = [];

let runtime_cursor = 'crosshair';

if (window.location.toString().startsWith("file://")) {
    alert('quadplay cannot run from a local filesystem. It requires a web server (which may be local...see the manual)');
    throw new Error();
}

// The gif recording object, if in a recording
let gifRecording = null;

let audioContext;

// Table mapping controller IDs that we've seen to what non-keyboard
// device was set on them 
const controllerTypeTable = JSON.parse(localStorage.getItem('controllerTypeTable') || '{}');

function defaultControlType(playerIndex) {
    if (playerIndex === 0) {
        if (isMobile) {
            return 'Quadplay';
        } else {
            return 'Kbd_Alt';
        }
    } else if (playerIndex === 1) {
        return 'Kbd_P2';
    } else {
        return 'Quadplay';
    }
}


// See also controllerTypeTable and setPadType()
function detectControllerType(id) {
    let type = controllerTypeTable[id];
    
    if (type === undefined) {
        // Not previously on this machine observed. Apply heuristics
        if (/ps3|playstation(r)3/i.test(id)) {
            type = 'PlayStation3';
        } else if (/ps4|playstation/i.test(id)) {
            type = 'PlayStation4';
        } else if (/joy-con (r)/i.test(id)) {
            type = 'JoyCon_R';
        } else if (/joy-con (l)/i.test(id)) {
            type = 'JoyCon_L';
        } else if (/joy-con/i.test(id)) {
            type = 'JoyCon_R';
        } else if (/stadia/i.test(id)) {
            type = 'Stadia';
        } else if (/xbox 360/i.test(id)) {
            type = 'Xbox360';
        } else if (/xbox|xinput/i.test(id)) {
            type = 'Xbox';
        } else if (/snes/i.test(id)) {
            type = 'SNES';
        } else if (/8bitdo +s[fn]30/i.test(id)) {
            type = 'SNES';
        } else if (/8bitdo +zero/i.test(id)) {
            type = 'Zero';
        } else if (/hotas/i.test(id)) {
            type = 'HOTAS';
        } else if (id === 'DB9 to USB v2.0 (Vendor: 289b Product: 004a)') {
            type = 'Genesis';
        } else {
            type = 'Quadplay';
        }
    }
    
    return type;
}


function setPadType(p, type) {
    const prompt = controlSchemeTable[type];
    if (p === undefined || p < 0 || p > 3) { throw new Error('"setPadType" must be used with an index from 0 to 3'); }
    if (! prompt) { throw new Error('"setPadType" must be used with one of the legal types, such as "Quadplay" or "PS4" (received "' + type + '")'); }

    const gamepad = QRuntime.gamepad_array[p]
    gamepad.type = type;
    gamepad.prompt = Object.freeze(Object.assign({'##': '' + (p + 1)}, prompt));
    const id = gamepad.$id;
    if (id && !/^keyboard|^kbd_/i.test(type)) {
        // Update the autodetection table based on what we just learned from this user
        controllerTypeTable[id] = type;
        localStorage.setItem('controllerTypeTable', JSON.stringify(controllerTypeTable));
    }
    
    // Update the stored binding for this controller
    localStorage.setItem('pad0' + p, JSON.stringify({id: id, type: type}));
}


function device_control(cmd) {
    switch (cmd) {
    case "start_GIF_recording":     startGIFRecording(); break;
    case "stop_GIF_recording":      stopGIFRecording(); break;
    case "take_screenshot":         downloadScreenshot(); break;
    case "take_label_image":        if (editableProject) { takeLabelImage(); } break;
    case "start_preview_recording": if (editableProject) { startPreviewRecording(); } break;
    case "set_debug_flag":
        {
            let value = (arguments[2] ? true : false);
            switch (arguments[1]) {
            case "entity_bounds":
                QRuntime.$showEntityBoundsEnabled = document.getElementById('showEntityBoundsEnabled').checked = value;
                break;
            case "physics":
                QRuntime.$showPhysicsEnabled = document.getElementById('showPhysicsEnabled').checked = value;
                break;
            case "debug_print":
                QRuntime.$debugPrintEnabled = document.getElementById('debugPrintEnabled').checked = value;
                break;
            case "assert":
                QRuntime.$assertEnabled = document.getElementById('assertEnabled').checked = value;
                break;
            case "debug_watch":
                QRuntime.$debugWatchEnabled = document.getElementById('debugWatchEnabled').checked = value;
                break;
            default:
                throw new Error('Unsupported flagname passed to device_control("setDebugFlag", flagname, value): "' + arguments[1] + '"');
            }
        }
        break;
        
    case "get_debug_flag":
        {
            switch (arguments[1]) {
            case "entity_bounds":
                return QRuntime.$showEntityBoundsEnabled;
                break;
            case "physics":
                return QRuntime.$showPhysicsEnabled;
                break;
            case "debug_print":
                return QRuntime.$debugPrintEnabled;
                break;
            case "assert":
                return QRuntime.$assertEnabled;
                break;
            case "debug_watch":
                return QRuntime.$debugWatchEnabled;
                break;
            default:
                throw new Error('Unsupported flagname passed to device_control("get_debug_flag", flagname): "' + arguments[1] + '"');
            }
        }
        break;
        
    case "get_analog_axes":
        {
            const player = clamp(parseInt(arguments[1] || 0), 0, 3);
            const stick = clamp(parseInt(arguments[2] || 0), 0, 1);
            const pad = QRuntime.gamepad_array[player];
            return Object.freeze({x: pad.$analog[2 * stick] * QRuntime.$scaleX, y: pad.$analog[2 * stick + 1] * QRuntime.$scaleY});
            break;
        }

    case "set_mouse_cursor":
        {
            runtime_cursor = QRuntime.unparse(arguments[1]).replace(/[^_a-z]/g, '');
            emulatorScreen.style.cursor = overlayScreen.style.cursor = runtime_cursor;
            break;
        }
        
    case "set_mouse_lock":
        // The state will be remembered and applied by pause and play buttons
        usePointerLock = arguments[1] !== false;
        if (usePointerLock) {
            maybeGrabPointerLock();
        } else {
            releasePointerLock();
        }
        break;
        
    case "get_mouse_state":
        {
            const mask = mouse.buttons;
            const xy = Object.freeze({
                x: (mouse.screen_x - QRuntime.$offsetX) / QRuntime.$scaleX,
                y: (mouse.screen_y - QRuntime.$offsetY) / QRuntime.$scaleY});

            const dxy = Object.freeze({
                x: ((mouse.movement_x === undefined) ? (mouse.screen_x - mouse.screen_x_prev) : mouse.movement_x) * QRuntime.$scaleX,
                y: ((mouse.movement_y === undefined) ? (mouse.screen_y - mouse.screen_y_prev) : mouse.movement_y) * QRuntime.$scaleY});

            return Object.freeze({
                x: xy.x,
                y: xy.y,
                dx: dxy.x,
                dy: dxy.y,
                xy: xy,
                dxy: dxy,
                lock: usePointerLock,
                cursor: overlayScreen.style.cursor,
                button_array: Object.freeze([
                    (mask & 1),
                    (mask & 2) >> 1,
                    (mask & 4) >> 2,
                    (mask & 8) >> 3,
                    (mask & 16) >> 4,
                    (mask & 32) >> 5])});
            break;
        }

    case "set_pad_type":
        {
            const i = arguments[1];
            const type = arguments[2];
            setPadType(i, type);
            break;
        }

    case "console.dir":
        console.dir(...Array.prototype.slice.call(arguments, 1));
        break;

    case "save":
        if (useIDE && isQuadserver) {
            const filename = arguments[1];
            const value = arguments[2];
            const callback = arguments[3];
            if (typeof filename === 'string' && filename.indexOf('/') === -1 && filename.indexOf('\\') === -1 && filename.endsWith('.json')) {
                try {
                    const jsonString = WorkJSON.stringify(value);
                    serverWriteFile(makeURLRelativeToGame(filename), 'utf8', jsonString, callback ? function() { callback(value, filename); } : undefined);
                } catch (e) {
                    // Fail silently
                    console.log(e);
                }
            }
        }
        break;

    case "load":
        if (useIDE && isQuadserver) {
            const filename = arguments[1];
            const callback = arguments[2];
            if (typeof filename === 'string' && filename.indexOf('/') === -1 && filename.indexOf('\\') === -1 && filename.endsWith('.json') && callback) {
                LoadManager.fetchOne({forceReload: true}, makeURLRelativeToGame(filename), 'json', null, function (json) {
                    try {
                        callback(json, filename);
                    } catch (e) {
                        // Fail silently
                        console.log(e);
                    }
                });
            } // if legal filename
        }
        break;

    case "enable_feature":
        {
            switch (arguments[1]) {
            case '768x448,private_views':
                QRuntime.$feature_768x448 = true;
                break;
                
            case '640x360,private_views':
                QRuntime.$feature_640x360 = true;
                break;
                
            default:
                throw new Error('Unknown feature to device_control("enable_feature", feature): "' + arguments[1] + '"');
            }
            break;
        } // enable_feature
    }
}


window.AudioContext = window.AudioContext || window.webkitAudioContext;
console.assert(window.AudioContext);
let volumeLevel = parseFloat(localStorage.getItem('volumeLevel') || '1');
document.getElementById('volumeSlider').value = Math.round(volumeLevel * 100);
try {
    audioContext = new AudioContext({
        latencyHint: 'interactive',

        // Sounds significantly above 11 kHz are quite unpleasant
        // and are generally not even audible to adults.
        // Halve memory consumption by dropping the audio rate
        // of the entire audio context. (http://www.noiseaddicts.com/2009/03/can-you-hear-this-hearing-test/)
        sampleRate: 22050
        /*44100*/
    });
    audioContext.gainNode = audioContext.createGain();
    audioContext.gainNode.gain.value = 0.2 * volumeLevel;
    audioContext.gainNode.connect(audioContext.destination);
} catch(e) {
    console.log(e);
}

function onVolumeChange() {
    volumeLevel = parseInt(document.getElementById('volumeSlider').value) / 100;
    localStorage.setItem('volumeLevel', '' + volumeLevel);
    audioContext.gainNode.gain.value = 0.2 * volumeLevel;
}

/************** Emulator event handling ******************************/
let emulatorKeyState = {};
let emulatorKeyJustPressed = {};
let emulatorKeyJustReleased = {};

const screenshotKey = 117; // F6
const gifCaptureKey = 119; // F8

function resetEmulatorKeyState() {
    emulatorKeyState = {};
    emulatorKeyJustPressed = {};
    emulatorKeyJustReleased = {};
}

function makeFilename(s) {
    return s.replace(/\s|:/g, '_').replace(/[^A-Za-z0-9_\.\(\)=\-\+]/g, '').replace(/_+/g, '_');
}

function onEmulatorKeyDown(event) {
    event.stopPropagation();
    event.preventDefault();
    wake();

    // On browsers that support it, ignore
    // synthetic repeat events
    if (event.repeat) { return; }

    const key = event.code;
    if (useIDE && ((key === 'KeyP') && (event.ctrlKey || event.metaKey))) {
        // Ctrl+P is pause the IDE, not in-game pause
        onPauseButton();
        return;
    }

    emulatorKeyState[key] = true;
    emulatorKeyJustPressed[key] = true;

    // Pass event to the main IDE
    onDocumentKeyDown(event);
}


function makeDateFilename() {
    const now = new Date();
    const dateString = now.getFullYear() + '-' + twoDigit(now.getMonth() + 1) + '-' + twoDigit(now.getDate()) + '_' + twoDigit(now.getHours()) + 'h' + twoDigit(now.getMinutes());
    const tag = ((gameSource.debug && gameSource.debug.json && gameSource.debug.json.screenshot_tag_enabled) ? gameSource.debug.json.screenshot_tag : gameSource.json.screenshot_tag).trim();
    return makeFilename(dateString + (tag === '' ? '' : '_') + tag);
}


function twoDigit(num) {
    return ((num < 10) ? '0' : '') + num;
}

function downloadScreenshot() {
    // Screenshot
    download(emulatorScreen.toDataURL(), makeDateFilename() + '.png');
}

function takeLabelImage() {
    // Don't capture labels at tiny resolutions
    if (SCREEN_WIDTH < 128) {
        console.log('Cannot take label images below 128 width');
        return;
    }

    // Copy the center 128x128
    const label = document.createElement('canvas');
    label.width = 128; label.height = 128;
    const ctx = label.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(emulatorScreen, (SCREEN_WIDTH - 128) >> 1, (SCREEN_HEIGHT - 128) >> 1, 128, 128, 0, 0, 128, 128);
    download(label.toDataURL(), 'label128.png');

    label.width = 64; label.height = 64;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(emulatorScreen, (SCREEN_WIDTH - 128) >> 1, (SCREEN_HEIGHT - 128) >> 1, 128, 128, 0, 0, 64, 64);
    download(label.toDataURL(), 'label64.png');
}


const PREVIEW_FRAMES_X = 6;
const PREVIEW_FRAMES_Y = 10;

function startPreviewRecording() {
    if (! previewRecording) {
        // Force 20 fps
        QRuntime.$graphicsPeriod = 3;
        previewRecording = new Uint32Array(192 * 112 * PREVIEW_FRAMES_X * PREVIEW_FRAMES_Y);
        previewRecordingFrame = 0;
    }
}


function processPreviewRecording() {
    const targetX = (previewRecordingFrame % PREVIEW_FRAMES_X) * 192;
    const targetY = Math.floor(previewRecordingFrame / PREVIEW_FRAMES_X) * 112;

    // Process differently depending on the screen resolution
    if (SCREEN_WIDTH === 384 && SCREEN_HEIGHT === 224) {
        // Full resolution. Average pixels down.
        for (let y = 0; y < 112; ++y) {
            let dstOffset = (y + targetY) * 192 * PREVIEW_FRAMES_X + targetX;
            for (let x = 0; x < 192; ++dstOffset, ++x) {
                // Average four pixels
                let r = 0, g = 0, b = 0;

                for (let dy = 0; dy <= 1; ++dy) {
                    for (let dx = 0; dx <= 1; ++dx) {
                        const src = QRuntime.$screen[(x*2 + dx) + (y*2 + dy) * 384];
                        r += (src >>> 8) & 0xf;
                        g += (src >>> 4) & 0xf;
                        b += src & 0xf;
                    } // dx
                } // dy

                // 16->32
                r |= r << 4;
                g |= g << 4;
                b |= b << 4;
                previewRecording[dstOffset] = (((r >> 2) & 0xff) << 16) + (((g >> 2) & 0xff) << 8) + ((b >> 2) & 0xff);
            } // x
        } // y
    } else if (SCREEN_WIDTH === 320 && SCREEN_HEIGHT === 180) {
        // Crop
        for (let y = 0; y < 112; ++y) {
            const offset = (y + 22) * 320 + 64;
            previewRecording.set(updateImageData32.slice(offset, offset + 192, targetX + (targetY + y) * 192 * PREVIEW_FRAMES_X));
        }
    } else if (SCREEN_WIDTH === 192 && SCREEN_HEIGHT === 112) {
        // Half-resolution. Copy lines directly
        for (let y = 0; y < 112; ++y) {
            previewRecording.set(updateImageData32.slice(y * 192, (y + 1) * 192), targetX + (targetY + y) * 192 * PREVIEW_FRAMES_X);
        }
    } else if (SCREEN_WIDTH === 128 && SCREEN_HEIGHT === 128) {
        // 128x128. Crop
        for (let y = 0; y < 112; ++y) {
            previewRecording.set(updateImageData32.slice((y + 8) * 128, (y + 9) * 128), (targetX + 32) + (targetY + y) * 192 * PREVIEW_FRAMES_X);
        }
    } else if (SCREEN_WIDTH === 128 && SCREEN_HEIGHT === 128) {
        // 64x64. Copy
        for (let y = 0; y < 64; ++y) {
            previewRecording.set(updateImageData32.slice(y * 64, (y + 1) * 64), (targetX + 64) + (targetY + y + 64) * 192 * PREVIEW_FRAMES_X);
        }
    } else {
        alert('Preview recording not supported at this resolution');
        throw new Error('Preview recording not supported at this resolution');
    }
    
    ++previewRecordingFrame;
    if (previewRecordingFrame >= PREVIEW_FRAMES_X * PREVIEW_FRAMES_Y) {
        // Set the alpha channel and reduce to 4:4:4
        for (let i = 0; i < previewRecording.length; ++i) {
            const c = previewRecording[i];
            const r = (c >>> 20) & 0xf;
            const g = (c >>> 12) & 0xf;
            const b = (c >>> 4)  & 0xf;
            previewRecording[i] = 0xff000000 | (r << 20) | (r << 16) | (g << 12) | (g << 8) | (b << 4) | b;
        }
        
        // Copy over data to a canvas
        const img = document.createElement('canvas');
        img.width = 192 * PREVIEW_FRAMES_X; img.height = 112 * PREVIEW_FRAMES_Y;
        const imgCTX = img.getContext('2d');
        const data = imgCTX.createImageData(img.width, img.height);
        new Uint32Array(data.data.buffer).set(previewRecording);
        imgCTX.putImageData(data, 0, 0);

        // Display the result
        // Download the result
        download(img.toDataURL(), 'preview.png');
        previewRecordingFrame = 0;
        previewRecording = null;
    }
}


let gifCtx = null;

function startGIFRecording() {
    if (! gifRecording) {
        document.getElementById('recording').innerHTML = 'RECORDING';
        document.getElementById('recording').classList.remove('hidden');
        const baseScale = 1;
        const scale = ((updateImage.width <= 384/2) ? (updateImage.width <= 64 ? 4 : 2) : 1) * baseScale;
        gifRecording = new GIF({workers:4, quality:3, dither:false, width: scale * updateImage.width, height: scale * updateImage.height});
        gifRecording.frameNum = 0;

        gifRecording.scale = scale;
        if (gifRecording.scale > 1) {
            const gifImage = document.createElement('canvas');
            gifImage.width = gifRecording.scale * updateImage.width;
            gifImage.height = gifRecording.scale * updateImage.height;
            gifCtx = gifImage.getContext("2d");
            gifCtx.msImageSmoothingEnabled = gifCtx.webkitImageSmoothingEnabled = gifCtx.imageSmoothingEnabled = false;
        }
        
        gifRecording.on('finished', function (blob) {
            //window.open(URL.createObjectURL(blob));
            download(URL.createObjectURL(blob), makeDateFilename() + '.gif');

            document.getElementById('recording').innerHTML = '';
            document.getElementById('recording').classList.add('hidden');
            gifCtx = null;
        });
    }
}


function stopGIFRecording() {
    if (gifRecording) {
        // Save
        document.getElementById('recording').innerHTML = 'Encoding GIF…';
        gifRecording.render();
        gifRecording = null;
    }
}


function toggleGIFRecording() {
    if (gifRecording) {
        stopGIFRecording();
    } else {
        startGIFRecording();
    }
}


function onEmulatorKeyUp(event) {
    const key = event.code;
    emulatorKeyState[key] = false;
    emulatorKeyJustReleased[key] = true;
    event.stopPropagation();
    event.preventDefault();
}

const emulatorKeyboardInput = document.getElementById('emulatorKeyboardInput');
emulatorKeyboardInput.addEventListener('keydown', onEmulatorKeyDown, false);
emulatorKeyboardInput.addEventListener('keyup', onEmulatorKeyUp, false);

/** Returns the ascii code of this character */
function ascii(x) { return x.charCodeAt(0); }

/** Used by $submitFrame() to map axes and buttons to event key codes when sampling the keyboard controller */
const keyMap = [{'-x':['KeyA', 'ArrowLeft'], '+x':['KeyD', 'ArrowRight'], '-y':['KeyW', 'ArrowUp'], '+y':['KeyS', 'ArrowDown'], a:['KeyB', 'Space'],  b:['KeyH', 'Enter'],  c:['KeyV', 'KeyV'],     d:['KeyG', 'KeyG'],          e:['ShiftLeft', 'ShiftLeft'], f:['KeyC', 'ShiftRight'],  q:['Digit1', 'KeyQ'],   p:['Digit4', 'KeyP', 'Escape']},
                {'-x':['KeyJ', 'KeyJ'],      '+x':['KeyL', 'KeyL'],       '-y':['KeyI', 'KeyI'],    '+y':['KeyK', 'KeyK'],     a:['Slash', 'Slash'], b:['Quote', 'Quote'], c:['Period', 'Period'], d:['Semicolon', 'Semicolon'], e:['KeyN','KeyN'],            f:['AltRight', 'AltLeft'], q:['Digit7', 'Digit7'], p:['Digit0', 'Digit0']}];
      
let prevRealGamepadState = [];

// Maps names of gamepads to arrays for mapping standard buttons
// to that gamepad's buttons. gamepadButtonRemap[canonicalButton] = actualButton (what
// html5gamepad.com returns when that button is pressed)
//
// Standard mapping https://www.w3.org/TR/gamepad/standard_gamepad.svg
const gamepadButtonRemap = {
    'identity':                                    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    
    // Windows SNES30
    'SNES30 Joy     (Vendor: 2dc8 Product: ab20)': [1, 0, 4, 3, 6, 7, 5, 2,10,11, 8, 9,   12, 13, 14, 15, 16],

    // Linux SNES30
    '8Bitdo SNES30 GamePad (Vendor: 2dc8 Product: 2840)': [1, 0, 4, 3, 6, 7, 5, 2,10,11, 8, 9,   12, 13, 14, 15, 16],

    'T.Flight Hotas X (Vendor: 044f Product: b108)':[0, 1, 3, 2, 4, 5, 6, 7, 10, 11, 8, 9, 12, 13, 14, 15, 16],

    // Nintendo Switch SNES official controller under safari
    '57e-2017-SNES Controller': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 12, 13, 14, 15],
    'SNES Controller (Vendor: 057e Product: 2017)': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19, 12, 13, 14, 15],

    // Raphnet adapter with the retro bit SEGA Genesis and Mega Drive controllers
    'DB9 to USB v2.0 (Vendor: 289b Product: 004a)': [0, 1, 4, 5, 4, 2, 8, 9, 7, 3, 10, 11, 12, 13, 14, 15, 16]
};

const gamepadAxisRemap = {
    'identity':                                      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    'T.Flight Hotas X (Vendor: 044f Product: b108)': [0, 1, 6, 2, 4, 5, 3, 7, 8, 9]
};


function getIdealGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    const gamepadArray = [];
    // Center of gamepad
    const deadZone = 0.35;
    
    // Compact gamepads array and perform thresholding
    for (let i = 0; i < gamepads.length; ++i) {
        const pad = gamepads[i];
        if (pad && pad.connected) {
            // Construct a simplified web gamepad API
            const mypad = {axes: [0, 0, 0, 0], buttons: [], analogAxes: [0, 0, 0, 0], id: pad.id};

	    const axisRemap = gamepadAxisRemap[pad.id] || gamepadAxisRemap.identity;
            
            for (let a = 0; a < Math.min(4, pad.axes.length); ++a) {
                const axis = pad.axes[axisRemap[a]];
                mypad.axes[a] = (Math.abs(axis) > deadZone) ? Math.sign(axis) : 0;
                mypad.analogAxes[a] = axis;
            }
            
            // Process all 17 buttons/axes as digital buttons first
	    const buttonRemap = gamepadButtonRemap[pad.id] || gamepadButtonRemap.identity;
            for (let b = 0; b < 17; ++b) {
                const button = pad.buttons[buttonRemap[b]];
                // Different browsers follow different APIs for the value of buttons
                mypad.buttons[b] = (typeof button === 'object') ? button.pressed : (button >= 0.5);
            }

            // D-pad is buttons U = 12, D = 13, L = 14, R = 15.
            // Use it to override the axes right here.
            if (mypad.buttons[15]) {
                mypad.axes[0] = +1;
            } else if (mypad.buttons[14]) {
                mypad.axes[0] = -1;
            }

            if (mypad.buttons[12]) {
                mypad.axes[1] = -1;
            } else if (mypad.buttons[13]) {
                mypad.axes[1] = +1;
            }

            gamepadArray.push(mypad);
            
            if (gamepadArray.length > prevRealGamepadState.length) {
                prevRealGamepadState.push({axes:[0, 0, 0, 0], 
                    buttons:[false, false, false, false, // 0-3: ABXY buttons
                             false, false, false, false, // 4-7: LB,RB,LT,RT
                             false, false, // 8 & 9: start + select
                             false, false, // 10 & 11: LS, RS
                             false, false, false, false // 12-15: D-pad
                             ]});
            }
        }
    }

    return gamepadArray;
}

let emulatorButtonState = {};

////////////////////////////////////////////////////////////////////////////////////
//
// Sounds

/** All sound sources that are playing */
const activeSoundHandleMap = new Map();

/** Called for both hitting the end naturally and stop_audio() */
function soundSourceOnEnded() {
    if (this.state === 'PLAYING') {
        this.state = 'ENDED';
        this.resumePositionMs = this.audioContext.currentTime * 1000 - this.startTimeMs;
    }
    activeSoundHandleMap.delete(this.handle);

    // The specification is unclear on whether we must disconnect
    // the nodes or not when the sound ends.
    this.gainNode.disconnect();
    this.panNode.disconnect();
    this.disconnect();
}


function internalSoundSourcePlay(handle, sound, startPositionMs, loop, volume, pitch, pan, rate, stopped) {
    if (stopped === undefined) { stopped = false; }
    pan = Math.min(1, Math.max(-1, pan))
    
    const source = audioContext.createBufferSource();
    source.sound = sound;
    source.buffer = sound.$buffer;
    // Needed because AudioNode.context is undefined in the onEnded callback
    source.audioContext = audioContext;

    if (audioContext.createStereoPanner) {
        source.panNode = audioContext.createStereoPanner();
        source.panNode.pan.setValueAtTime(pan, audioContext.currentTime);
    } else {
        source.panNode = audioContext.createPanner();
        source.panNode.panningModel = 'equalpower';
        source.panNode.setPosition(pan, 0, 1 - Math.abs(pan));
    }
    source.gainNode = audioContext.createGain();
    source.gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    source.connect(source.panNode);
    source.panNode.connect(source.gainNode);
    source.gainNode.connect(audioContext.gainNode);
    
    source.onended = soundSourceOnEnded;
    source.state = 'PLAYING';
    
    if (! source.start) {
        // Backwards compatibility, needed on Safari
        source.start = source.noteOn;
        source.stop  = source.noteOff;
    }
    
    source.handle = handle;
    source.sound = sound;
    source.startTimeMs = audioContext.currentTime * 1000 - startPositionMs;
    source.loop = loop;
   
    activeSoundHandleMap.set(handle, true);
    handle.$source = source;
    handle.sound = sound;

    set_playback_rate(handle, rate);
    set_pitch(handle, pitch);
    set_volume(handle, volume);
    set_pan(handle, pan);

    source.start(0, (startPositionMs % (source.buffer.duration * 1000)) / 1000);
    if (stopped) {
        source.stop();
        source.resumePositionMs = source.startTimeMs;
        source.state = 'STOPPED';
    }

    return handle;
}


// In seconds; lerp all parameter changes over 1 frame to seem
// smoother and support continuous variation.
const audioRampTime = 1 / 60;

function set_volume(handle, volume) {
    if (! (handle && handle.$source)) {
        throw new Error("Must call set_volume() on a sound returned from play_sound()");
    }
    if (typeof volume !== 'number' || isNaN(volume) || ! isFinite(volume)) {
        throw new Error("The volume must be a finite number (got " + volume + ")");
    }
    handle.$source.volume = volume;
    volume *= handle.$source.sound.$base_volume;
    handle.$source.gainNode.gain.linearRampToValueAtTime(volume, handle.$source.context.currentTime + audioRampTime);
}


function set_playback_rate(handle, rate) {
    if (! (handle && handle.$source)) {
        throw new Error("Must call set_volume() on a sound returned from play_sound()");
    }
    handle.$source.rate = rate;
    rate *= handle.$source.sound.$base_rate;
    handle.$source.playbackRate.value = rate;
}


function set_pan(handle, pan) {
    if (! (handle && handle.$source)) {
        throw new Error("Must call set_pan() on a sound returned from play_sound()");
    }
    if (typeof pan !== 'number' || isNaN(pan) || ! isFinite(pan)) {
        throw new Error("The pan must be a finite number (got " + pan + ")");
    }
    pan = Math.min(1, Math.max(-1, pan))

    handle.$source.pan = pan;
    
    pan += handle.$source.sound.$base_pan;
    pan = Math.min(1, Math.max(-1, pan))
    if (handle.$source.panNode.pan) {
        handle.$source.panNode.pan.linearRampToValueAtTime(pan, handle.$source.context.currentTime + audioRampTime);
    } else {
        // Safari fallback
        handle.$source.panNode.setPosition(pan, 0, 1 - Math.abs(pan));
    }
}


let warnedAboutPitch = false;
function set_pitch(handle, pitch) {
    if (! (handle && handle.$source)) {
        throw new Error("Must call set_pitch() on a sound returned from play_sound()");
    }
    if (typeof pitch !== 'number' || isNaN(pitch) || ! isFinite(pitch) || pitch <= 0) {
        throw new Error("The pitch must be a positive finite number (got " + pitch + ")");
    }
    handle.$source.pitch = pitch;
    pitch *= handle.$source.sound.$base_pitch;
    if (handle.$source.detune) {
        // The detune argument is in cents:
        //
        // c = 1200 * log2 (f2 / f1)
        // c = 1200 * log2(pitch)
        handle.$source.detune.linearRampToValueAtTime(Math.log2(pitch) * 1200, handle.$source.context.currentTime + audioRampTime);
    } else if (! warnedAboutPitch) {
        if (isSafari) {
            showPopupMessage('Safari does not support pitch changes.');
        } else {
            showPopupMessage('This browser does not support pitch changes.');
        }
        warnedAboutPitch = true;
    }
}


function get_audio_status(handle) {
    if (! (handle && handle.$source)) {
        throw new Error("Must call get_sound_status() on a sound returned from play_sound()");
    }

    const source = handle.$source;

    let now = 0;
    if (source.state === 'PLAYING') {
        now = source.context.currentTime * 1000 - source.startTimeMs;
    } else {
        now = source.resumePositionMs;
    }
    now *= 0.001;
        
    return {
        sound:    source.sound,
        pitch:    source.pitch,
        volume:   source.volume,
        playback_rate: source.rate,
        pan:      source.pan,
        loop:     source.loop,
        state:    source.state,
        now:      now
    }
}


// Exported to QRuntime
function play_sound(sound, loop, volume, pan, pitch, time, rate, stopped) {
    if (! sound || ! sound.$source) {
        console.log(sound);
        throw new Error('play_sound() requires a sound asset');
    }

    // Ensure that the value is a boolean
    loop = loop ? true : false;
    time = time || 0;
    if (pan === undefined) { pan = 0; }
    if (pitch === undefined) { pitch = 1; }
    if (volume === undefined) { volume = 1; }

    if (isNaN(pitch)) {
        throw new Error('pitch cannot be NaN for play_sound()');
    }

    if (isNaN(volume)) {
        throw new Error('volume cannot be NaN for play_sound()');
    }

    if (isNaN(pan)) {
        throw new Error('pan cannot be NaN for play_sound()');
    }

    rate = rate || 1;

    if (sound.$loaded) {
        return internalSoundSourcePlay({}, sound, time * 1000, loop, volume, pitch, pan, rate, stopped);
    } else {
        return undefined;
    }
}


// Exported to QRuntime
function resume_audio(handle) {
    if (! (handle && handle.$source && handle.$source.stop)) {
        throw new Error("resume_audio() takes one argument that is the handle returned from play_sound()");
    }
    
    if (handle.$source.state !== 'PLAYING') {
        // A new source must be created every time that the sound is
        // played or resumed. There is no way to pause a source in the
        // current WebAudio API.
        internalSoundSourcePlay(handle, handle.$source.sound, handle.$source.resumePositionMs, handle.$source.loop, handle.$source.volume, handle.$source.pitch, handle.$source.pan, handle.$source.rate);
    }
}


// Exported to QRuntime
function stop_audio(handle) {
    // Intentionally fail silently
    if (handle === undefined) { return; }
    
    if (! (handle && handle.$source && handle.$source.stop)) {
        throw new Error("stop_audio() takes one argument that is the handle returned from play_sound()");
    }
    
    try { 
        handle.$source.state = 'STOPPED';
        handle.$source.resumePositionMs = handle.$source.audioContext.currentTime * 1000 - handle.$source.startTimeMs;
        handle.$source.stop();
    } catch (e) {
        // Ignore invalid state error if loading has not succeeded yet
    }
}


function pauseAllSounds() {
    audioContext.suspend();
}


function stopAllSounds() {
    // Resume in case we were paused
    audioContext.resume();

    for (const handle of activeSoundHandleMap.keys()) {
        try { handle.$source.stop(); } catch (e) {}
    }
    activeSoundHandleMap.clear();
}


function resumeAllSounds() {
    audioContext.resume();
}

////////////////////////////////////////////////////////////////////////////////////

// Injected as debug_print in QRuntime
// Escapes HTML
function debug_print(location, ...args) {
    let s = '';
    for (let i = 0; i < args.length; ++i) {
        let m = args[i]
        if (typeof m !== 'string') { m = QRuntime.unparse(m, 3); }
        s += m;
        if (i < args.length - 1) {
            s += ' ';
        }
    }
    
    $outputAppend(escapeHTMLEntities(s) + '\n', location);
}


// Injected as assert in QRuntime
function assert(x, m) {
    if (! x) {
        throw new Error(m || "Assertion failed");
    }
}

// Allows HTML, forces the system style
function $systemPrint(m, style) {
    $outputAppend('<i' + (style ? ' style="' + style + '">' : '>') + escapeHTMLEntities(m) + '</i>\n');
}


// Allows HTML. location may be undefined
function $outputAppend(m, location) {    
    if (m !== '') {
        // Remove tags and then restore HTML entities
        console.log(m.replace(/<.+?>/g, '').replace(/&quot;/g,'"').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<'));

        const MAX_LENGTH = 300;
        if (outputDisplayPane.childNodes.length > MAX_LENGTH) {
            // Remove a lot, so that we amortize the cost of manipulating the DOM
            while (outputDisplayPane.childNodes.length > MAX_LENGTH - 10) {
                outputDisplayPane.removeChild(outputDisplayPane.firstChild);
            }
        }

        if (location && location.url) {
            let tooltip = location.url.replace(/^.*\//, '');
            if (/[A-Z]/.test(tooltip[0])) {
                // For modes, remove the extension
                tooltip = tooltip.replace(/\.pyxl$/, '');
            }
            tooltip += ':' + location.line_number;
            
            m = `<span style="cursor:pointer" title="${tooltip}" onclick="editorGotoFileLine('${location.url}', ${location.line_number}, undefined, false)">${m}</span>`;
        }
        
        outputDisplayPane.insertAdjacentHTML('beforeend', m);
        
        // Scroll to bottom
        outputDisplayPane.scrollTop = outputDisplayPane.scrollHeight - outputDisplayPane.clientHeight;
    }
}


function rgbaToCSSFillStyle(color) {
    return `rgba(${color.r*255}, ${color.g*255}, ${color.b*255}, ${color.a})`;
}


function onScreenDrawBarGraph(title, value, color, i) {
    const y1 = i * 14 + 1;
    QRuntime.$executeREC({
        opcode: 'REC',
        data: [{x1: 0, y1: y1, x2: Math.min(Math.floor(SCREEN_WIDTH * value / 12), SCREEN_WIDTH - 1), y2: y1 + 12, fill: color, outline:0xF000}],
        clipX1:  0,
        clipY1:  0,
        clipX2:  SCREEN_WIDTH - 1,
        clipY2:  SCREEN_HEIGHT - 1
    });
    
    QRuntime.$executeTXT({
        opcode:  'TXT',
        str:     title + ' ' + QRuntime.format_number(value, ' 0.0') + 'ms',
        fontIndex: QRuntime.$font8.$index[0],
        x:       1,
        y:       y1,
        z:       4000,
        color:   0xF000,
        outline: color,
        shadow:  0,
        height:  10,
        width:   100,
        clipX1:  0,
        clipY1:  0,
        clipX2:  SCREEN_WIDTH - 1,
        clipY2:  SCREEN_HEIGHT - 1
    });
}

// Invoked as QRuntime.$submitFrame(). May not actually be invoked every
// frame if running below framerate.
function submitFrame() {
    // Hack the FPS overlay directly onto the screen
    if (QRuntime.$onScreenHUDEnabled) {
        onScreenDrawBarGraph('Frame:', onScreenHUDDisplay.time.frame, 0xFA5F, 0);
        onScreenDrawBarGraph('  60fps Logic:', onScreenHUDDisplay.time.logic, 0xFFA0, 1);
        onScreenDrawBarGraph('  ' + onScreenHUDDisplay.time.refresh + 'fps Graphics:', onScreenHUDDisplay.time.graphics, 0xF0D0, 2);
        if (onScreenHUDDisplay.time.physics > 0) {
            onScreenDrawBarGraph('  60fps Physics:', onScreenHUDDisplay.time.physics, 0xF0AF, 3);
        }
        if (onScreenHUDDisplay.time.browser > 0) {
            onScreenDrawBarGraph('  Browser:', onScreenHUDDisplay.time.browser, 0xFAAA, 4);
        }
    }
    
    // Update the image
    const $postFX = QRuntime.$postFX;
    const hasPostFX = ($postFX.opacity < 1) || ($postFX.color.a > 0) || ($postFX.angle !== 0) ||
          ($postFX.pos.x !== 0) || ($postFX.pos.y !== 0) ||
          ($postFX.scale.x !== 1) || ($postFX.scale.y !== 1) ||
          ($postFX.blend_mode !== 'source-over');

    {
        // Convert 16-bit to 32-bit
        const dst32 = updateImageData32;
        const src32 = QRuntime.$screen32;
        const N = src32.length;
        for (let s = 0, d = 0; s < N; ++s) {
            // Read two 16-bit pixels at once
            let src = src32[s];
            
            // Turn into two 32-bit pixels as ABGR -> FFBBGGRR. Only
            // read color channels, as the alpha channel is overwritten with fully
            // opaque.
            let C = ((src & 0x0f00) << 8) | ((src & 0x00f0) << 4) | (src & 0x000f);
            dst32[d] = 0xff000000 | C | (C << 4); ++d; src = src >> 16;
            
            C = ((src & 0x0f00) << 8) | ((src & 0x00f0) << 4) | (src & 0x000f);
            dst32[d] = 0xff000000 | C | (C << 4); ++d;
        }
    }
    
    if (previewRecording) {
        processPreviewRecording();
    }

    if ((! isHosting || isFirefox || isSafari) && ! hasPostFX && ! gifRecording && (emulatorScreen.width === SCREEN_WIDTH && emulatorScreen.height === SCREEN_HEIGHT)) {
        // Directly upload to the screen. Fast path when there are no PostFX.
        //
        // Chromium (Chrome & Edge) have a bug where we can't get a video stream
        // from the direct putImageData, so they are excluded from this path when
        // hosting.
        ctx.putImageData(updateImageData, 0, 0);
    } else {
        // Put on an intermediate image and then stretch. This path is for postFX and supporting Safari
        // and other platforms where context graphics can perform nearest-neighbor interpolation but CSS scaling cannot.
        const updateCTX = updateImage.getContext('2d', {alpha: false});
        updateCTX.putImageData(updateImageData, 0, 0);
        if ($postFX.color.a > 0) {
            updateCTX.fillStyle = rgbaToCSSFillStyle($postFX.color);
            updateCTX.globalCompositeOperation = $postFX.blend_mode;
            updateCTX.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        }

        ctx.save();
        if ($postFX.background.a > 0) {
            if (($postFX.background.r === 0) && ($postFX.background.g === 0) && ($postFX.background.b === 0) && ($postFX.background.a === 0)) {
                ctx.clearRect(0, 0, emulatorScreen.width, emulatorScreen.height);
            } else {
                ctx.fillStyle = rgbaToCSSFillStyle($postFX.background);
                ctx.fillRect(0, 0, emulatorScreen.width, emulatorScreen.height);
            }
        }
        ctx.globalAlpha = $postFX.opacity;
        ctx.translate(($postFX.pos.x / SCREEN_WIDTH + 0.5) * emulatorScreen.width,
                      ($postFX.pos.y / SCREEN_HEIGHT + 0.5) * emulatorScreen.height); 
        ctx.rotate(-$postFX.angle);
        ctx.scale($postFX.scale.x, $postFX.scale.y);
        ctx.translate(-emulatorScreen.width / 2, -emulatorScreen.height / 2); 
        ctx.drawImage(updateImage,
                      0, 0, SCREEN_WIDTH, SCREEN_HEIGHT,
                      0, 0, emulatorScreen.width, emulatorScreen.height);
        ctx.restore();
    }

    maybeApplyBloom($postFX.bloom, allow_bloom);

    /*
    // Random graphics for debugging
    ctx.fillStyle = '#FF0';
    for (let i = 0; i < 2; ++i) {
        ctx.fillRect(Math.floor(Math.random() * 364), Math.floor(Math.random() * 204), 20, 20);
        ctx.fillStyle = '#04F';
    }
    */
    
    // Send the frame if this machine is an online host
    
    if (isHosting && hostVideoStream) {
        const track = hostVideoStream.getVideoTracks()[0];
        if (track.requestFrame) {
            track.requestFrame();
        }
    }
    
    if (gifRecording) {
        // Only record alternating frames to reduce file size
        if (gifRecording.frameNum & 1) {
            if (gifRecording.scale > 1) {
                // Repeat pixels
                gifCtx.imageSmoothingEnabled = false;
                gifCtx.drawImage(emulatorScreen,
                                 0, 0, emulatorScreen.width, emulatorScreen.height,
                                 0, 0, SCREEN_WIDTH * gifRecording.scale, SCREEN_HEIGHT * gifRecording.scale);
                gifRecording.addFrame(gifCtx, {delay: 1000/30, copy: true});
            } else {
                gifRecording.addFrame(updateImage.getContext('2d'), {delay: 1000/30, copy: true});
            }
        }
        ++gifRecording.frameNum;
        if (gifRecording.frameNum > 60 * 12) {
            // Stop after 12 seconds
            document.getElementById('recording').classList.add('hidden');
            gifRecording.render();
            gifRecording = null;
        }
    }

    refreshPending = true;
}


/* Used by guesting as well as local rendering */
function maybeApplyBloom(bloom, enable) {
    if (bloom > 0 && enable) {
        overlayScreen.style.visibility = 'visible';
        // Apple devices are gamma corrected and the bloom looks dimmer as a
        // result, so we boost it
        const b = Math.pow(bloom, 1.5) * (isApple ? 1.5 : 1.0);
        overlayScreen.style.filter = `brightness(${0.45 + b * (1 - 0.45)}) contrast(3) blur(2.5px)` + (bloom > 0.5 ? ` brightness(${0.75 * bloom + 0.5})`: '');
        overlayCTX.drawImage(emulatorScreen, 0, 0);
    } else {
        overlayScreen.style.visibility = 'hidden';
    }
}


// Called by show() to trigger sampling input
function requestInput() {
    updateKeyboardPending = true;
}


function updateInput() {
    mouse.screen_x_prev = mouse.screen_x;
    mouse.screen_y_prev = mouse.screen_y;
    
    const axes = 'xy', AXES = 'XY', buttons = 'abcdefpq';

    // HTML gamepad indices of corresponding elements of the buttons array
    // A, B, C, D, E, F, _P, Q
    const buttonIndex = [0, 1, 2, 3, 4, 5, 9, 8];
    
    // Aliases on console game controller
    const altButtonIndex = [undefined, undefined, undefined, undefined, 6, 7, undefined, undefined];

    // Also processes input
    const gamepadArray = getIdealGamepads();

    // Sample the keys
    let anyInteraction = false;
    for (let player = 0; player < 4; ++player) {
        const reordered_player = gamepadOrderMap[player];
        const map = keyMap[player], pad = QRuntime.gamepad_array[player],
              realGamepad = gamepadArray[reordered_player], prevRealGamepad = prevRealGamepadState[reordered_player];

        // Network player
        if (pad.$status === 'guest') {
            const latest = pad.$guest_latest_state;
            if (! latest) { return; }

            // Digital axes
            for (let i = 0; i < axes.length; ++i) {
                const axis = axes[i];
                const oldv = pad['$' + axis];
                const newv  = latest['$' + axis];
                
                pad['$d' + axis] = newv - oldv;
                pad['$' + axis + axis] = (newv !== oldv) ? newv : 0;
                pad['$' + axis] = newv;
            }

            // Analog axes
            for (let a = 0; a < pad.$analog.length; ++a) {
                pad.$analog[a] = latest.$analog[a];
            }

            // Buttons
            for (let b = 0; b < buttons.length; ++b) {
                const button = buttons[b];
                const prefix = button === 'p' ? '$' : '';
                const BUT = prefix + button;
                const oldv = pad[prefix + button];
                const newv = latest[prefix + button];

                pad[prefix + button + button] = pad[prefix + 'pressed_' + button] = (newv >= 0.5) && (oldv < 0.5) ? 1 : 0;
                pad[prefix + 'released_' + button] = (newv < 0.5) && (oldv >= 0.5) ? 1 : 0;
                pad[prefix + button] = newv;
            }

            pad.$id = latest.$id;
            if (latest.type !== pad.type) {
                pad.type = latest.type;
                pad.prompt = Object.freeze(Object.assign({'##' : '' + (player + 1)}, controlSchemeTable[pad.type]));
            }
            
            continue;
        }
        
        // Have player 0 physical alt controls set player 1 virtual buttons only
        // if there is no second controller physically present
	const altRealGamepad = ((player === 1) && ! realGamepad) ? gamepadArray[gamepadOrderMap[0]] : undefined,
	      altPrevRealGamepad = ((player === 1) && ! realGamepad) ? prevRealGamepadState[gamepadOrderMap[0]] : undefined;

        if (realGamepad && (realGamepad.id !== pad.$id)) {
            // The gamepad just connected or changed. Update the control scheme.
            pad.$id = realGamepad.id;
            pad.type = detectControllerType(realGamepad.id);
            pad.prompt = Object.freeze(Object.assign({'##' : '' + (player + 1)}, controlSchemeTable[pad.type]));
        } else if (! realGamepad && (pad.$id !== '') && (pad.$id !== 'mobile')) {
            // Gamepad was just disconnected. Update the control scheme.
            pad.$id = isMobile ? 'mobile' : '';
            pad.type = defaultControlType(player);
            pad.prompt = Object.freeze(Object.assign({'##' : '' + (player + 1)}, controlSchemeTable[pad.type]));
        }

        // Analog controls
        for (let a = 0; a < 4; ++a) {
            pad.$analog[a] = realGamepad ? realGamepad.analogAxes[a] : 0;
        }
        
        // Axes
        for (let a = 0; a < axes.length; ++a) {
            const axis = axes[a];
            const pos = '+' + axis, neg = '-' + axis;
            const old = pad['$' + axis];

            if (map) {
                // Keyboard controls
                const n0 = map[neg][0], n1 = map[neg][1], p0 = map[pos][0], p1 = map[pos][1];

                // Current state
                pad['$' + axis] = (((emulatorKeyState[n0] || emulatorKeyState[n1]) ? -1 : 0) +
                                   ((emulatorKeyState[p0] || emulatorKeyState[p1]) ? +1 : 0));

                // Just pressed
                pad['$' + axis + axis] = (((emulatorKeyJustPressed[n0] || emulatorKeyJustPressed[n1]) ? -1 : 0) +
                                          ((emulatorKeyJustPressed[p0] || emulatorKeyJustPressed[p1]) ? +1 : 0));
            } else {
                // Nothing currently pressed
                pad['$' + axis] = pad['$' + axis + axis] = 0;
            }

            if (realGamepad) {
                pad['$' + axis] = pad['$' + axis] || realGamepad.axes[a];
            }

            if (realGamepad && (prevRealGamepad.axes[a] !== realGamepad.axes[a])) {
                pad['$' + axis + axis] = pad['$' + axis + axis] || realGamepad.axes[a];
            }

            if (gameSource.json.dual_dpad && (player === 1) && gamepadArray[gamepadOrderMap[0]]) {
                const otherPad = gamepadArray[gamepadOrderMap[0]];
                // Alias controller[0] right stick (axes 2 + 3)
                // to controller[1] d-pad (axes 0 + 1) for "dual stick" controls                
                if (otherPad.axes[a + 2] !== 0) {
                    pad['$' + axis] = pad['$' + axis] || otherPad.axes[a + 2];
                }
                if (otherPad.axes[a + 2] !== otherPad.axes[a + 2]) {
                    pad['$' + axis + axis] = pad['$' + axis + axis] || otherPad.axes[a + 2];
                }
            } // dual-stick

            // Derivative
            pad['$d' + axis] = pad['$' + axis] - old;
            const axisChange = (pad['$d' + axis] !== 0);
            anyInteraction = anyInteraction || axisChange;
            if (axisChange && pad.$status === 'absent') {
                pad.$status = 'present';
            }

        } // axes
        
        for (let b = 0; b < buttons.length; ++b) {
            const button = buttons[b];
            const prefix = button === 'p' ? '$' : '';
            
            if (map) {
                // Keyboard (only P1's P button has three codes)
                const b0 = map[button][0], b1 = map[button][1], b2 = map[button][2];
                pad[prefix + button] = (emulatorKeyState[b0] || emulatorKeyState[b1] || emulatorKeyState[b2]) ? 1 : 0;
                pad[prefix + button + button] = pad[prefix + 'pressed_' + button] = (emulatorKeyJustPressed[b0] || emulatorKeyJustPressed[b1] || emulatorKeyJustPressed[b2]) ? 1 : 0;
                pad[prefix + 'released_' + button] = (emulatorKeyJustReleased[b0] || emulatorKeyJustReleased[b1] || emulatorKeyJustReleased[b2]) ? 1 : 0;
            } else {
                pad[prefix + button] = pad[prefix + button + button] = pad[prefix + 'released_' + button] = pad[prefix + 'pressed_' + button] = 0;
            }

            const i = buttonIndex[b], j = altButtonIndex[b];
            const isPressed  = realGamepad && (realGamepad.buttons[i] || realGamepad.buttons[j]);
	    
            const wasPressed = prevRealGamepad && (prevRealGamepad.buttons[i] || prevRealGamepad.buttons[j]);
	    
            if (isPressed) { pad[prefix + button] = 1; }
	    
            if (isPressed && ! wasPressed) {
                pad[prefix + button + button] = 1;
                pad[prefix + 'pressed_' + button] = 1;
            }

            if (! isPressed && wasPressed) {
                pad[prefix + 'released_' + button] = 1;
            }

            const buttonChange = (pad[prefix + button] !== 0);
            anyInteraction = anyInteraction || buttonChange;
            if (buttonChange && pad.$status === 'absent') {
                pad.$status = 'present';
            }
        }
    }

    // Update angles for all players (local and remote)
    for (let player = 0; player < 4; ++player) {
        const pad = QRuntime.gamepad_array[player];
        const oldAngle = pad.$angle;
        if ((pad.$y !== 0) || (pad.$x !== 0)) {
            pad.$angle = Math.atan2(-pad.$y, pad.$x);
        }

        if ((pad.$y === pad.$dy && pad.$x === pad.$dx) || (pad.$y === 0 && pad.$x === 0)) {
            pad.$dangle = 0;
        } else {
            // JavaScript operator % is a floating-point operation
            pad.$dangle = ((3 * Math.PI + pad.$angle - oldAngle) % (2 * Math.PI)) - Math.PI;
        }
    }
    
    // Update previous state. This has to be done AFTER the above loop
    // so that any alternative state for player 2 are not immediately
    // overriden during player 1's processing. These do not need to be
    // remapped because they are a straight copy.
    for (let i = 0; i < 4; ++i) {
        if (gamepadArray[i]) {
            prevRealGamepadState[i] = gamepadArray[i];
        }
    }

    if (anyInteraction) { updateLastInteractionTime(); }

    // Reset the just-pressed state
    emulatorKeyJustPressed = {};
    emulatorKeyJustReleased = {};
}

////////////////////////////////////////////////////////////////////////////////////////////
//
// Mobile button support
//
// Because a touch end for *one* finger could occur for an element
// that still has another finger holding it down, we have to track
// all active touches and synthesize events for them rather than
// simply execute the mouse handlers directly. We also can't allow
// the mouse handers to *automatically* fire, since they run at a
// 300 ms delay on mobile.

// For use when processing buttons
const emulatorButtonArray = Array.from(document.getElementsByClassName('emulatorButton'));
const deadZoneArray = Array.from(document.getElementsByClassName('deadZone'));

// Maps touch.identifiers to objects with x and y members
const activeTouchTracker = {};

/* event must have clientX and clientY */
function inElement(event, element) {
    const rect = element.getBoundingClientRect();
    if (element.style.transform === 'rotate(45deg)') {
        // Assume symmetrical
        const centerX = rect.left + rect.width * 0.5;
        const centerY = rect.top + rect.height * 0.5;
        return Math.abs(centerX - event.clientX) + Math.abs(centerY - event.clientY) < rect.width * 0.5;
    } else {
        return (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom);
    }
}


function onTouchStartOrMove(event) {
    wake();
    updateLastInteractionTime();

    for (let i = 0; i < event.changedTouches.length; ++i) {
        const touch = event.changedTouches[i];
        let tracker = activeTouchTracker[touch.identifier];

        if (event.target === emulatorScreen || event.target === overlayScreen) {
            const screen_coord = emulatorScreenEventCoordToQuadplayScreenCoord(touch);

            if (! tracker || tracker.lastTarget !== emulatorScreen || tracker.lastTarget !== overlayScreen) {
                // New touch
                QRuntime.touch.aa = ! QRuntime.touch.a;
                QRuntime.touch.pressed_a = QRuntime.touch.aa;
                QRuntime.touch.a = true;
                QRuntime.touch.screen_dx = 0;
                QRuntime.touch.screen_dy = 0;
            } else {
                // Continued touch
                QRuntime.touch.screen_dx = screen_coord.x - QRuntime.touch.screen_x;
                QRuntime.touch.screen_dy = screen_coord.y - QRuntime.touch.screen_y;
            }
            
            QRuntime.touch.screen_x = screen_coord.x;
            QRuntime.touch.screen_y = screen_coord.y;

            
            if (QRuntime.touch.aa && document.getElementById('printTouchEnabled').checked) {
                $systemPrint('touch.screen_xy: xy(' + QRuntime.touch.screen_x + ', ' + QRuntime.touch.screen_y + ')');
            }
        }

        if (tracker && (tracker.lastTarget === emulatorScreen || tracker.lastTarget === overlayScreen) && (event.target !== emulatorScreen && event.target !== overlayScreen)) {
            // Lost contact with screen
            QRuntime.touch.a = false;
            QRuntime.touch.released_a = true;
        }

        if (! tracker) {
            tracker = activeTouchTracker[touch.identifier] = {identifier: touch.identifier};
        }
        
        tracker.clientX = touch.clientX;
        tracker.clientY = touch.clientY;
        tracker.lastTarget = event.target;
    }

    onTouchesChanged(event);

    if ((event.target === emulatorScreen || event.target === overlayScreen) || (event.target.className === 'emulatorButton')) {
        // Prevent default browser handling on virtual controller buttons
        event.preventDefault();
        event.stopPropagation();
        event.cancelBubble = true;
    }

    return false;
}


function onTouchEndOrCancel(event) {
    // Add the new touches
    for (let i = 0; i < event.changedTouches.length; ++i) {
        const touch = event.changedTouches[i];
        const tracker = activeTouchTracker[touch.identifier];
        
        // The tracker *should* be found, but check defensively
        // against weird event delivery
        if (tracker) {
            if (tracker.lastTarget === emulatorScreen || tracker.lastTarget === overlayScreen) {
                // Lost contact with screen
                QRuntime.touch.a = false;
                QRuntime.touch.released_a = true;
            }
            
            // Delete is relatively slow (https://jsperf.com/delete-vs-undefined-vs-null/16),
            // but there are far more move events than end events and the table is more
            // convenient and faster for processing move events than an array.
            delete activeTouchTracker[touch.identifier];            
        }
    }
    
    onTouchesChanged(event);
    return false;
}

/* Processes all emulatorButtons against the activeTouchTracker. If
   any *changed* touch was currently over a button, cancels the event. */
function onTouchesChanged(event) {
    // Do not process buttons when they aren't visible
    if (uiMode !== 'Emulator') { return; }
    
    // Latch state
    for (let j = 0; j < emulatorButtonArray.length; ++j) {
        const button = emulatorButtonArray[j];
        button.wasPressed = button.currentlyPressed || false;
        button.currentlyPressed = false;
    }
    
    // Processes all touches to see what is currently pressed
    for (let t in activeTouchTracker) {
        const touch = activeTouchTracker[t];
        let touchPressed = true;

        // Test against dead zone
        for (let j = 0; j < deadZoneArray.length; ++j) {
            if (inElement(touch, deadZoneArray[j])) {
                touchPressed = false;
                break;
            }
        }

        // Process all buttons
        for (let j = 0; j < emulatorButtonArray.length; ++j) {
            const button = emulatorButtonArray[j];
            button.currentlyPressed = button.currentlyPressed ||
                (inElement(touch, button) && touchPressed);
        }
    }

    // Now see which buttons differ from their previous state
    for (let j = 0; j < emulatorButtonArray.length; ++j) {
        const button = emulatorButtonArray[j];
        if (button.wasPressed !== button.currentlyPressed) {
            // This button's state changed
            const buttonCode = button.id.substring(0, button.id.length - 'button'.length);

            // Fake a keyboard event
            const fakeEvent = {code: buttonCode, stopPropagation:Math.abs, preventDefault:Math.abs}
            
            if (button.currentlyPressed) {
                onEmulatorKeyDown(fakeEvent);
                emulatorButtonState[buttonCode] = 1;
            } else {
                onEmulatorKeyUp(fakeEvent);
                emulatorButtonState[buttonCode] = 0;
            }
        }
    }

    // See if this event was in any of the buttons (including on and
    // end event, where it will not be in the touch list) and then
    // prevent/stop that event so that we don't get a synthetic mouse event
    // or scroll.
    for (let i = 0; i < event.changedTouches.length; ++i) {
        let touch = event.changedTouches[i];
        for (let j = 0; j < emulatorButtonArray.length; ++j) {
            if (inElement(touch, emulatorButtonArray[j])) {
                event.preventDefault();
                event.stopPropagation();
                break;
            }
        }
    }
}

const fakeMouseEvent = {
    changedTouches: [{identifier:-1, clientX: 0, clientY:0}],
    realEvent: null,
    preventDefault: function() { this.realEvent.preventDefault(); },
    stopPropagation: function() { this.realEvent.stopPropagation(); this.realEvent.cancelBubble = true; },
};

function emulatorScreenEventCoordToQuadplayScreenCoord(event) {
    const rect = emulatorScreen.getBoundingClientRect();
    
    let zoom = 1;
    if (isSafari) {
        zoom = parseFloat(document.getElementById('screenBorder').style.zoom || '1');
    }

    return {x: clamp(Math.round(emulatorScreen.width  * (event.clientX - rect.left * zoom) / (rect.width  * zoom)), 0, emulatorScreen.width  - 1) + 0.5,
            y: clamp(Math.round(emulatorScreen.height * (event.clientY - rect.top  * zoom) / (rect.height * zoom)), 0, emulatorScreen.height - 1) + 0.5};
}

const mouse = {screen_x: 0, screen_y: 0, screen_x_prev: 0, screen_y_prev: 0, buttons: 0, movement_movement: false};

function updateMouseDevice(event) {
    if (event.target === emulatorScreen || event.target === overlayScreen) {
        const coord = emulatorScreenEventCoordToQuadplayScreenCoord(event);
        mouse.screen_x = coord.x;
        mouse.screen_y = coord.y;

        if (event.movementX !== undefined) {
            const rect = emulatorScreen.getBoundingClientRect();

            let zoom = 1;
            if (isSafari) {
                zoom = parseFloat(document.getElementById('screenBorder').style.zoom || '1');
            }

            if (mouse.movement_x === undefined) {
                mouse.movement_x = mouse.movement_y = 0;
            }

            // Movement events are available on this browser. They are higher precision and
            // survive pointer lock, so report them instead. These must be ACCUMULATED because
            // they arrive at the monitor's refresh rate, not the game's refresh rate. On
            // high framerate monitors we need to know the total of all mouse events. These
            // are zeroed again in the main game loop.            
            mouse.movement_x += emulatorScreen.width  * event.movementX / (rect.width  * zoom);
            mouse.movement_y += emulatorScreen.height * event.movementY / (rect.height * zoom);
            mouse.movement = true;
        }
    }
    mouse.buttons = event.buttons;
}


function onMouseDownOrMove(event) {
    updateMouseDevice(event);
    // Allow mouse movement to prevent sleep, but not to wake
    updateLastInteractionTime();
    
    if (event.buttons !== 0) {
        // Do not wake on mouse movement, only buttons
        wake();

        // Synthesize a fake touch event (which will then get turned
        // into a fake key event!)
        fakeMouseEvent.changedTouches[0].clientX = event.clientX;
        fakeMouseEvent.changedTouches[0].clientY = event.clientY;
        fakeMouseEvent.realEvent = event;
        fakeMouseEvent.target = event.target;
        return onTouchStartOrMove(fakeMouseEvent);
    }
}


function onMouseUpOrMove(event) {
    updateMouseDevice(event);
    // Synthesize a fake touch event (which will then get turned
    // into a fake key event!)
    fakeMouseEvent.changedTouches[0].clientX = event.clientX;
    fakeMouseEvent.changedTouches[0].clientY = event.clientY;
    fakeMouseEvent.realEvent = event;
    fakeMouseEvent.target = event.target;
    return onTouchEndOrCancel(fakeMouseEvent);
}


/* quadplay-host is loaded before quadplay-ide, so we put this initialization in a callback. */
function initializeBrowserEmulator() {
    // Prevent hitches for touch event handling on Android Chrome
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
    const options = {passive: false, capture: true};
    document.addEventListener('mousedown',   onMouseDownOrMove, options);
    document.addEventListener('mousemove',   onMouseDownOrMove, options);
    document.addEventListener('mouseup',     onMouseUpOrMove, options);
    document.addEventListener('touchstart',  onTouchStartOrMove, options);
    document.addEventListener('touchmove',   onTouchStartOrMove, options);
    document.addEventListener('touchend',    onTouchEndOrCancel, options);
    document.addEventListener('touchcancel', onTouchEndOrCancel, options);
}
