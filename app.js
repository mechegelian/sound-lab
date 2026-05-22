const $ = (id) => document.getElementById(id);

// ---------------- BASIC UI ----------------
const startButton = $("startButton");
const playAllButton = $("playAllButton");
const stopAllButton = $("stopAllButton");
const randomButton = $("randomButton");

const textureAButton = $("textureAButton");
const textureBButton = $("textureBButton");
const textureCButton = $("textureCButton");
const textureDButton = $("textureDButton");
const textureEButton = $("textureEButton");

const controlTargetSelect = $("controlTargetSelect");
const volumeSlider = $("volumeSlider");
const filterSlider = $("filterSlider");
const speedSlider = $("speedSlider");
const distortionSlider = $("distortionSlider");

const masterReverbSlider = $("masterReverbSlider");
const masterDelaySlider = $("masterDelaySlider");
const masterWidthSlider = $("masterWidthSlider");
const masterOutputSlider = $("masterOutputSlider");

// ---------------- MUSIC ENGINE ----------------
const bpmSlider = $("bpmSlider");
const bpmValue = $("bpmValue");
const swingSlider = $("swingSlider");
const swingValue = $("swingValue");
const sceneSelect = $("sceneSelect");
const patternSelect = $("patternSelect");
const rootSelect = $("rootSelect");
const scaleSelect = $("scaleSelect");
const modDepthSlider = $("modDepthSlider");
const modDepthValue = $("modDepthValue");
const applySceneButton = $("applySceneButton");
const drumTestButton = $("drumTestButton");

// ---------------- GLITCH ----------------
const glitchChanceSlider = $("glitchChanceSlider");
const glitchChanceValue = $("glitchChanceValue");
const glitchRateSlider = $("glitchRateSlider");
const glitchRateValue = $("glitchRateValue");
const glitchPitchSlider = $("glitchPitchSlider");
const glitchPitchValue = $("glitchPitchValue");
const glitchToneSlider = $("glitchToneSlider");
const glitchToneValue = $("glitchToneValue");
const triggerGlitchButton = $("triggerGlitchButton");
const toggleAutoGlitchButton = $("toggleAutoGlitchButton");

// ---------------- OSC / SPEC ----------------
const pauseOscilloscopeButton = $("pauseOscilloscopeButton");
const resumeOscilloscopeButton = $("resumeOscilloscopeButton");
const holdOscilloscopeButton = $("holdOscilloscopeButton");
const resetOscilloscopeZoomButton = $("resetOscilloscopeZoomButton");
const toggleOscilloscopeGridButton = $("toggleOscilloscopeGridButton");
const oscZoomX = $("oscZoomX");
const oscZoomY = $("oscZoomY");
const oscGlowAmount = $("oscGlowAmount");
const oscTrailAmount = $("oscTrailAmount");
const oscLineSize = $("oscLineSize");

const pauseSpectrogramButton = $("pauseSpectrogramButton");
const resumeSpectrogramButton = $("resumeSpectrogramButton");
const clearSpectrogramButton = $("clearSpectrogramButton");

const oscilloscopeCanvas = $("oscilloscope");
const oscilloscopeCtx = oscilloscopeCanvas.getContext("2d");
const spectrogramCanvas = $("spectrogram");
const spectrogramCtx = spectrogramCanvas.getContext("2d");
const spectrogramOverlayCanvas = $("spectrogramOverlay");
const spectrogramOverlayCtx = spectrogramOverlayCanvas.getContext("2d");

// ---------------- TWEAKS ----------------
const driftSlider = $("driftSlider");
const driftValue = $("driftValue");
const smearSlider = $("smearSlider");
const smearValue = $("smearValue");
const grainSlider = $("grainSlider");
const grainValue = $("grainValue");
const motionSlider = $("motionSlider");
const motionValue = $("motionValue");

// ---------------- MIX ----------------
const dryWetSlider = $("dryWetSlider");
const dryWetValue = $("dryWetValue");
const glueSlider = $("glueSlider");
const glueValue = $("glueValue");
const widthMixSlider = $("widthMixSlider");
const widthMixValue = $("widthMixValue");
const punchSlider = $("punchSlider");
const punchValue = $("punchValue");

// ---------------- DRAWERS ----------------
const drumSeqToggle = $("drumSeqToggle");
const drumSeqDrawer = $("drumSeqDrawer");
const acidSeqToggle = $("acidSeqToggle");
const acidSeqDrawer = $("acidSeqDrawer");

// ---------------- SEQ GRIDS ----------------
const drumKickGrid = $("drumKickGrid");
const drumSnareGrid = $("drumSnareGrid");
const drumHatGrid = $("drumHatGrid");
const drumClapGrid = $("drumClapGrid");
const drumPercGrid = $("drumPercGrid");
const drumSeqLength = $("drumSeqLength");

const acidStepGrid = $("acidStepGrid");
const acidAccentGrid = $("acidAccentGrid");
const acidSeqLength = $("acidSeqLength");
const acidCutoffSlider = $("acidCutoffSlider");
const acidResSlider = $("acidResSlider");
const acidEnvSlider = $("acidEnvSlider");
const acidSlideSlider = $("acidSlideSlider");

// ---------------- EQ ELEMENTS ----------------
const eqBands = ["60", "250", "1000", "4000", "8000", "15000"];

function getEqElements(prefix) {
  const out = {};
  eqBands.forEach((band) => {
    out[band] = $(`${prefix}Eq${band}`);
  });
  return out;
}

const acidEqEls = getEqElements("acid");
const drumEqEls = getEqElements("drum");
const fluteEqEls = getEqElements("flute");
const electroEqEls = getEqElements("electro");
const bassEqEls = getEqElements("bass");

// ---------------- LOOP ELEMENTS ----------------
function getLoopElements(prefix) {
  return {
    effect: $(`${prefix}LoopEffect`),
    interval: $(`${prefix}LoopInterval`),
    duration: $(`${prefix}LoopDuration`),
    start: $(`${prefix}LoopStart`),
    stop: $(`${prefix}LoopStop`),
    warning: $(`${prefix}LoopWarning`)
  };
}

const fluteLoop = getLoopElements("flute");
const electroLoop = getLoopElements("electro");
const bassLoop = getLoopElements("bass");

// ---------------- GLOBAL STATE ----------------
let audioStarted = false;
let sourcesStarted = false;

let acidOn = false;
let drumOn = false;
let fluteOn = false;
let electroOn = false;
let bassOn = false;

let oscilloscopePaused = false;
let oscilloscopeHold = false;
let oscilloscopeGrid = true;
let spectrogramPaused = false;

let fluteLoopId = null;
let electroLoopId = null;
let bassLoopId = null;

let stepIndex = 0;
let transportRepeatId = null;
let autoGlitchEnabled = false;

const spectrogramSecondsVisible = 8;

// ---------------- AUDIO ----------------
const waveformAnalyser = new Tone.Waveform(512);
const fftAnalyser = new Tone.FFT(64);

const masterGain = new Tone.Gain(1.0);
const masterFilter = new Tone.Filter(2200, "lowpass");
const masterLowShelf = new Tone.Filter(140, "lowshelf");
const masterHighShelf = new Tone.Filter(7000, "highshelf");
const masterDistortion = new Tone.Distortion(0);
const masterWidth = new Tone.StereoWidener(0.55);
const masterDelay = new Tone.FeedbackDelay(0.25, 0.2);
const masterReverb = new Tone.Reverb({ decay: 2.1, preDelay: 0.01 });
const masterCompressor = new Tone.Compressor(-16, 3);
const floorNoise = new Tone.Noise("pink");
const floorNoiseGain = new Tone.Gain(0.004);

masterDelay.wet.value = 0.08;
masterReverb.wet.value = 0.16;

// flute
const fluteGain = new Tone.Gain(0);
const fluteFilter = new Tone.Filter(1800, "bandpass");
const fluteDistortion = new Tone.Distortion(0);
const fluteNoise = new Tone.Noise("pink");
const fluteNoiseGain = new Tone.Gain(0.06);
const fluteOsc = new Tone.Oscillator(660, "triangle");
const fluteVibrato = new Tone.LFO(5, -10, 10);

// drum
const drumGain = new Tone.Gain(0);
const drumFilter = new Tone.Filter(2000, "lowpass");
const drumDistortion = new Tone.Distortion(0.04);

const kickSynth = new Tone.MembraneSynth({
  pitchDecay: 0.03,
  octaves: 6,
  oscillator: { type: "sine" },
  envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.02 }
});

const snareNoise = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.001, decay: 0.15, sustain: 0 }
});

const hatSynth = new Tone.MetalSynth({
  frequency: 260,
  envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
  harmonicity: 5.1,
  modulationIndex: 24,
  resonance: 3500,
  octaves: 1.5
});

const clapNoise = new Tone.NoiseSynth({
  noise: { type: "pink" },
  envelope: { attack: 0.001, decay: 0.08, sustain: 0 }
});

const percSynth = new Tone.MembraneSynth({
  pitchDecay: 0.015,
  octaves: 2,
  oscillator: { type: "triangle" },
  envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.02 }
});

// electro
const electroGain = new Tone.Gain(0);
const electroFilter = new Tone.Filter(2200, "lowpass");
const electroDistortion = new Tone.Distortion(0.08);
const electroOsc1 = new Tone.Oscillator(220, "sawtooth");
const electroOsc2 = new Tone.Oscillator(224, "square");
const electroLfo = new Tone.LFO(0.25, 600, 2600);

// bass
const bassGain = new Tone.Gain(0);
const bassFilter = new Tone.Filter(260, "lowpass");
const bassDistortion = new Tone.Distortion(0.03);
const bassOsc1 = new Tone.Oscillator(55, "sawtooth");
const bassOsc2 = new Tone.Oscillator(55.5, "square");

// acid
const acidGain = new Tone.Gain(0);
const acidFilter = new Tone.Filter(1100, "lowpass");
acidFilter.Q.value = 12;
const acidDistortion = new Tone.Distortion(0.05);
const acidSynth = new Tone.MonoSynth({
  oscillator: { type: "square" },
  filter: { Q: 8, type: "lowpass", rolloff: -24 },
  envelope: { attack: 0.001, decay: 0.18, sustain: 0.2, release: 0.08 },
  filterEnvelope: { attack: 0.001, decay: 0.14, sustain: 0.12, release: 0.05, baseFrequency: 300, octaves: 2.8 }
});

// ---------------- EQ NODES ----------------
function createSixBandEq() {
  const make = (freq) => {
    const f = new Tone.Filter(freq, "peaking");
    f.Q.value = 1;
    f.gain.value = 0;
    return f;
  };

  return {
    b60: make(60),
    b250: make(250),
    b1000: make(1000),
    b4000: make(4000),
    b8000: make(8000),
    b15000: make(15000)
  };
}

function chainSixBandEq(eq, inputNode, outputNode) {
  inputNode.connect(eq.b60);
  eq.b60.connect(eq.b250);
  eq.b250.connect(eq.b1000);
  eq.b1000.connect(eq.b4000);
  eq.b4000.connect(eq.b8000);
  eq.b8000.connect(eq.b15000);
  eq.b15000.connect(outputNode);
}

const acidEq = createSixBandEq();
const drumEq = createSixBandEq();
const fluteEq = createSixBandEq();
const electroEq = createSixBandEq();
const bassEq = createSixBandEq();

const acidEqOut = new Tone.Gain(1);
const drumEqOut = new Tone.Gain(1);
const fluteEqOut = new Tone.Gain(1);
const electroEqOut = new Tone.Gain(1);
const bassEqOut = new Tone.Gain(1);

// ---------------- CONNECTIONS ----------------
fluteNoise.connect(fluteNoiseGain);
fluteNoiseGain.connect(fluteFilter);
fluteOsc.connect(fluteFilter);
fluteVibrato.connect(fluteOsc.detune);
fluteFilter.connect(fluteDistortion);
chainSixBandEq(fluteEq, fluteDistortion, fluteEqOut);
fluteEqOut.connect(fluteGain);

kickSynth.connect(drumFilter);
snareNoise.connect(drumFilter);
hatSynth.connect(drumFilter);
clapNoise.connect(drumFilter);
percSynth.connect(drumFilter);
drumFilter.connect(drumDistortion);
chainSixBandEq(drumEq, drumDistortion, drumEqOut);
drumEqOut.connect(drumGain);

electroOsc1.connect(electroFilter);
electroOsc2.connect(electroFilter);
electroLfo.connect(electroFilter.frequency);
electroFilter.connect(electroDistortion);
chainSixBandEq(electroEq, electroDistortion, electroEqOut);
electroEqOut.connect(electroGain);

bassOsc1.connect(bassFilter);
bassOsc2.connect(bassFilter);
bassFilter.connect(bassDistortion);
chainSixBandEq(bassEq, bassDistortion, bassEqOut);
bassEqOut.connect(bassGain);

acidSynth.connect(acidFilter);
acidFilter.connect(acidDistortion);
chainSixBandEq(acidEq, acidDistortion, acidEqOut);
acidEqOut.connect(acidGain);

fluteGain.connect(masterFilter);
drumGain.connect(masterFilter);
electroGain.connect(masterFilter);
bassGain.connect(masterFilter);
acidGain.connect(masterFilter);
floorNoise.connect(floorNoiseGain);
floorNoiseGain.connect(masterFilter);

masterFilter.connect(masterLowShelf);
masterLowShelf.connect(masterHighShelf);
masterHighShelf.connect(masterDistortion);
masterDistortion.connect(masterCompressor);
masterCompressor.connect(masterWidth);
masterWidth.connect(masterDelay);
masterDelay.connect(masterReverb);
masterReverb.connect(masterGain);

masterGain.connect(waveformAnalyser);
masterGain.connect(fftAnalyser);
masterGain.toDestination();

// ---------------- DATA ----------------
const controlState = {
  master: { volume: 92, filter: 55, speed: 100, distortion: 0 },
  acid: { volume: 82, filter: 60, speed: 100, distortion: 8 },
  drum: { volume: 86, filter: 62, speed: 100, distortion: 4 },
  flute: { volume: 72, filter: 55, speed: 100, distortion: 0 },
  electro: { volume: 74, filter: 60, speed: 100, distortion: 12 },
  bass: { volume: 80, filter: 34, speed: 100, distortion: 5 }
};

const ROOT_MIDI = { C: 48, D: 50, E: 52, F: 53, G: 55, A: 57, B: 59 };

const SCALE_MAP = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  whole: [0, 2, 4, 6, 8, 10],
  pentatonic: [0, 3, 5, 7, 10]
};

const PATTERN_MAP = {
  straight: {
    bass: [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    electro: [0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,0],
    flute: [0,1,0,0, 0,0,1,0, 0,1,0,0, 0,0,1,0]
  },
  broken: {
    bass: [1,0,0,1, 0,0,1,0, 1,0,1,0, 0,0,1,0],
    electro: [0,1,0,1, 1,0,0,0, 0,1,0,1, 1,0,0,0],
    flute: [1,0,0,0, 0,1,0,0, 1,0,0,1, 0,0,1,0]
  },
  syncopated: {
    bass: [1,0,1,0, 0,1,0,0, 1,0,1,0, 0,0,1,0],
    electro: [0,1,0,0, 1,0,0,1, 0,1,0,0, 1,0,0,1],
    flute: [0,0,1,0, 0,1,0,1, 0,0,1,0, 0,1,0,0]
  },
  half: {
    bass: [1,0,0,0, 1,0,0,0, 1,0,0,0, 0,0,1,0],
    electro: [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    flute: [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0]
  }
};

const drumPattern = {
  kick: Array(16).fill(false),
  snare: Array(16).fill(false),
  hat: Array(16).fill(false),
  clap: Array(16).fill(false),
  perc: Array(16).fill(false)
};

const acidPattern = {
  steps: Array(16).fill(false),
  accent: Array(16).fill(false)
};

[0, 4, 8, 12].forEach((i) => (drumPattern.kick[i] = true));
[4, 12].forEach((i) => (drumPattern.snare[i] = true));
[2, 6, 10, 14].forEach((i) => (drumPattern.hat[i] = true));
[12].forEach((i) => (drumPattern.clap[i] = true));
[3, 7, 11, 15].forEach((i) => (drumPattern.perc[i] = true));

[0, 2, 3, 5, 7, 10, 11, 14].forEach((i) => (acidPattern.steps[i] = true));
[3, 7, 11, 15].forEach((i) => (acidPattern.accent[i] = true));

// ---------------- HELPERS ----------------
function sliderToGain(target, value) {
  if (target === "master") return value / 100;
  return value / 130;
}

function sliderToFrequency(value) {
  const minFreq = 120;
  const maxFreq = 5000;
  return minFreq + (value / 100) * (maxFreq - minFreq);
}

function getGainNode(target) {
  return {
    master: masterGain,
    acid: acidGain,
    drum: drumGain,
    flute: fluteGain,
    electro: electroGain,
    bass: bassGain
  }[target];
}

function getFilterNode(target) {
  return {
    master: masterFilter,
    acid: acidFilter,
    drum: drumFilter,
    flute: fluteFilter,
    electro: electroFilter,
    bass: bassFilter
  }[target];
}

function getDistortionNode(target) {
  return {
    master: masterDistortion,
    acid: acidDistortion,
    drum: drumDistortion,
    flute: fluteDistortion,
    electro: electroDistortion,
    bass: bassDistortion
  }[target];
}

function isSoundOn(target) {
  return (
    (target === "acid" && acidOn) ||
    (target === "drum" && drumOn) ||
    (target === "flute" && fluteOn) ||
    (target === "electro" && electroOn) ||
    (target === "bass" && bassOn)
  );
}

function requireSound(target) {
  if (!audioStarted) {
    alert("First click Start Audio");
    return false;
  }
  if (!isSoundOn(target)) {
    alert("Turn on the sound first");
    return false;
  }
  return true;
}

function getCrossmixMultiplier(target) {
  const wet = Number(dryWetSlider.value) / 100;
  if (target === "drum") return 1 + wet * 0.18;
  if (target === "acid") return 1 + wet * 0.12;
  return 1;
}

function getBaseGain(target) {
  return sliderToGain(target, controlState[target].volume) * getCrossmixMultiplier(target);
}

function pulseGain(node, baseGain, time, amount = 1.35, release = 0.16) {
  node.gain.cancelScheduledValues(time);
  node.gain.setValueAtTime(baseGain, time);
  node.gain.linearRampToValueAtTime(baseGain * amount, time + 0.01);
  node.gain.linearRampToValueAtTime(baseGain, time + release);
}

function buildScaleFrequencies(rootName, scaleName, octaveOffset = 0) {
  const rootMidi = ROOT_MIDI[rootName] + octaveOffset * 12;
  const degrees = SCALE_MAP[scaleName];
  return degrees.map((semi) => Tone.Frequency(rootMidi + semi, "midi").toFrequency());
}

function syncControlSlidersToTarget() {
  const target = controlTargetSelect.value;
  volumeSlider.value = controlState[target].volume;
  filterSlider.value = controlState[target].filter;
  speedSlider.value = controlState[target].speed;
  distortionSlider.value = controlState[target].distortion;
}

function applyStoredVolume(target) {
  const value = controlState[target].volume;
  if (target === "master") {
    masterGain.gain.value = sliderToGain("master", value);
    return;
  }
  const gainNode = getGainNode(target);
  if (gainNode && isSoundOn(target)) {
    gainNode.gain.value = getBaseGain(target);
  }
}

function applyStoredFilter(target) {
  const value = controlState[target].filter;
  const freq = sliderToFrequency(value);
  const filterNode = getFilterNode(target);
  if (filterNode) filterNode.frequency.value = freq;
}

function applyStoredDistortion(target) {
  const node = getDistortionNode(target);
  if (node) node.distortion = controlState[target].distortion / 100;
}

function applyStoredSpeed(target) {
  const mult = controlState[target].speed / 100;

  if (target === "flute") {
    fluteOsc.frequency.value = 660 * mult;
    fluteVibrato.frequency.value = 4 + Number(motionSlider.value) * 0.06;
  }
  if (target === "electro") {
    electroOsc1.frequency.value = 220 * mult;
    electroOsc2.frequency.value = 224 * mult;
    electroLfo.frequency.value = 0.25 + Number(motionSlider.value) / 200;
  }
  if (target === "bass") {
    bassOsc1.frequency.value = 55 * mult;
    bassOsc2.frequency.value = 55.5 * mult;
  }
  if (target === "acid") {
    acidFilter.frequency.value = 260 + mult * 10;
  }
}

function applyAllStoredControls() {
  ["master", "acid", "drum", "flute", "electro", "bass"].forEach((target) => {
    applyStoredFilter(target);
    applyStoredDistortion(target);
    applyStoredSpeed(target);
  });
}

// ---------------- MASTER FX ----------------
function applyMasterFx() {
  masterReverb.wet.value = Number(masterReverbSlider.value) / 100;
  masterDelay.wet.value = Number(masterDelaySlider.value) / 100;
  masterWidth.width.value = Number(masterWidthSlider.value) / 100;
  masterGain.gain.value = Number(masterOutputSlider.value) / 100;
}

masterReverbSlider.addEventListener("input", applyMasterFx);
masterDelaySlider.addEventListener("input", applyMasterFx);
masterWidthSlider.addEventListener("input", applyMasterFx);
masterOutputSlider.addEventListener("input", applyMasterFx);

// ---------------- EQ ----------------
function readEqValues(elementMap) {
  return {
    "60": Number(elementMap["60"].value),
    "250": Number(elementMap["250"].value),
    "1000": Number(elementMap["1000"].value),
    "4000": Number(elementMap["4000"].value),
    "8000": Number(elementMap["8000"].value),
    "15000": Number(elementMap["15000"].value)
  };
}

function applySixBandEq(eq, values) {
  eq.b60.gain.value = values["60"];
  eq.b250.gain.value = values["250"];
  eq.b1000.gain.value = values["1000"];
  eq.b4000.gain.value = values["4000"];
  eq.b8000.gain.value = values["8000"];
  eq.b15000.gain.value = values["15000"];
}

function bindEq(elementMap, eqNode) {
  eqBands.forEach((band) => {
    elementMap[band].addEventListener("input", () => {
      applySixBandEq(eqNode, readEqValues(elementMap));
    });
  });
}

bindEq(acidEqEls, acidEq);
bindEq(drumEqEls, drumEq);
bindEq(fluteEqEls, fluteEq);
bindEq(electroEqEls, electroEq);
bindEq(bassEqEls, bassEq);

applySixBandEq(acidEq, readEqValues(acidEqEls));
applySixBandEq(drumEq, readEqValues(drumEqEls));
applySixBandEq(fluteEq, readEqValues(fluteEqEls));
applySixBandEq(electroEq, readEqValues(electroEqEls));
applySixBandEq(bassEq, readEqValues(bassEqEls));

// ---------------- EQ GRAPH UI ----------------
function setupEqUI(toggleId, drawerId, canvasId, sliderIds) {
  const toggle = $(toggleId);
  const drawer = $(drawerId);
  const canvas = $(canvasId);
  if (!toggle || !drawer || !canvas) return;

  const ctx = canvas.getContext("2d");
  const sliders = sliderIds.map((id) => $(id)).filter(Boolean);
  let dragging = false;

  function values() {
    return sliders.map((slider) => Number(slider.value));
  }

  function valueToY(value, height) {
    const min = -12;
    const max = 12;
    const t = (value - min) / (max - min);
    return height - t * height;
  }

  function yToValue(y, height) {
    const min = -12;
    const max = 12;
    const t = 1 - y / height;
    return Math.round(min + t * (max - min));
  }

  function draw() {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i <= 6; i++) {
      const x = (width / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const y = (height / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    const vals = values();
    const points = vals.map((value, i) => ({
      x: (width / (vals.length - 1)) * i,
      y: valueToY(value, height)
    }));

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(140,255,109,0.16)";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#8cff6d";
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = "#8cff6d";
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();

    points.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = "#b7ff9f";
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function updateFromPointer(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const bandWidth = canvas.width / sliders.length;
    const bandIndex = Math.max(0, Math.min(sliders.length - 1, Math.floor(x / bandWidth)));
    const newValue = Math.max(-12, Math.min(12, yToValue(y, canvas.height)));

    sliders[bandIndex].value = newValue;
    sliders[bandIndex].dispatchEvent(new Event("input", { bubbles: true }));
    draw();
  }

  toggle.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    toggle.classList.toggle("active", open);
    draw();
  });

  sliders.forEach((slider) => slider.addEventListener("input", draw));

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    updateFromPointer(event);
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  canvas.addEventListener("pointermove", (event) => {
    if (dragging) updateFromPointer(event);
  });

  draw();
}

setupEqUI("acidEqToggle", "acidEqDrawer", "acidEqCanvas", ["acidEq60", "acidEq250", "acidEq1000", "acidEq4000", "acidEq8000", "acidEq15000"]);
setupEqUI("drumEqToggle", "drumEqDrawer", "drumEqCanvas", ["drumEq60", "drumEq250", "drumEq1000", "drumEq4000", "drumEq8000", "drumEq15000"]);
setupEqUI("fluteEqToggle", "fluteEqDrawer", "fluteEqCanvas", ["fluteEq60", "fluteEq250", "fluteEq1000", "fluteEq4000", "fluteEq8000", "fluteEq15000"]);
setupEqUI("electroEqToggle", "electroEqDrawer", "electroEqCanvas", ["electroEq60", "electroEq250", "electroEq1000", "electroEq4000", "electroEq8000", "electroEq15000"]);
setupEqUI("bassEqToggle", "bassEqDrawer", "bassEqCanvas", ["bassEq60", "bassEq250", "bassEq1000", "bassEq4000", "bassEq8000", "bassEq15000"]);

// ---------------- DRAWERS ----------------
drumSeqToggle.addEventListener("click", () => {
  const open = drumSeqDrawer.classList.toggle("open");
  drumSeqToggle.classList.toggle("active", open);
});

acidSeqToggle.addEventListener("click", () => {
  const open = acidSeqDrawer.classList.toggle("open");
  acidSeqToggle.classList.toggle("active", open);
});

// ---------------- TWEAKS / MIX ----------------
function bindSliderNumber(slider, number, callback) {
  slider.addEventListener("input", () => {
    number.value = slider.value;
    callback();
  });

  number.addEventListener("input", () => {
    const val = Math.max(Number(slider.min), Math.min(Number(slider.max), Number(number.value)));
    slider.value = val;
    number.value = val;
    callback();
  });
}

function applyTweaks() {
  const drift = Number(driftSlider.value);
  const smear = Number(smearSlider.value);
  const grain = Number(grainSlider.value);
  const motion = Number(motionSlider.value);

  fluteVibrato.min = -10 - drift * 0.35;
  fluteVibrato.max = 10 + drift * 0.35;
  fluteVibrato.frequency.value = 4 + motion * 0.07;

  electroLfo.min = 700 - motion * 5;
  electroLfo.max = 2600 + motion * 7;
  electroLfo.frequency.value = 0.25 + motion * 0.02;

  fluteNoiseGain.gain.value = 0.03 + grain / 900;
  floorNoiseGain.gain.value = 0.002 + grain / 8000;

  masterReverb.decay = 1.2 + smear / 24;
  masterDelay.delayTime.value = 0.15 + smear / 500;
}

function applyMix() {
  const wet = Number(dryWetSlider.value) / 100;
  const glue = Number(glueSlider.value);
  const widthMix = Number(widthMixSlider.value) / 100;
  const punch = Number(punchSlider.value);

  masterReverb.wet.value = wet * 0.8 + Number(masterReverbSlider.value) / 500;
  masterDelay.wet.value = wet * 0.45 + Number(masterDelaySlider.value) / 500;
  masterWidth.width.value = Math.min(1, widthMix);

  masterCompressor.threshold.value = -8 - glue * 0.22;
  masterCompressor.ratio.value = 1 + glue / 18;

  if (drumOn) drumGain.gain.value = getBaseGain("drum") * (1 + punch / 220);
  if (bassOn) bassGain.gain.value = getBaseGain("bass") * (1 + punch / 340);
  if (acidOn) acidGain.gain.value = getBaseGain("acid") * (1 + punch / 260);
}

[
  [driftSlider, driftValue, applyTweaks],
  [smearSlider, smearValue, applyTweaks],
  [grainSlider, grainValue, applyTweaks],
  [motionSlider, motionValue, applyTweaks],
  [dryWetSlider, dryWetValue, applyMix],
  [glueSlider, glueValue, applyMix],
  [widthMixSlider, widthMixValue, applyMix],
  [punchSlider, punchValue, applyMix]
].forEach(([s, n, cb]) => bindSliderNumber(s, n, cb));

// ---------------- SEQUENCER UI ----------------
function buildStepGrid(container, dataArray) {
  container.innerHTML = "";
  dataArray.forEach((isActive, index) => {
    const button = document.createElement("button");
    button.className = "step-button";
    button.textContent = index + 1;
    if (isActive) button.classList.add("active-step");
    button.addEventListener("click", () => {
      dataArray[index] = !dataArray[index];
      button.classList.toggle("active-step", dataArray[index]);
    });
    container.appendChild(button);
  });
}

function refreshSequencers() {
  buildStepGrid(drumKickGrid, drumPattern.kick);
  buildStepGrid(drumSnareGrid, drumPattern.snare);
  buildStepGrid(drumHatGrid, drumPattern.hat);
  buildStepGrid(drumClapGrid, drumPattern.clap);
  buildStepGrid(drumPercGrid, drumPattern.perc);
  buildStepGrid(acidStepGrid, acidPattern.steps);
  buildStepGrid(acidAccentGrid, acidPattern.accent);
}

function highlightCurrentStep(container, step, length) {
  [...container.children].forEach((child, i) => {
    child.classList.toggle("current-step", i === step && i < length);
  });
}

refreshSequencers();

// ---------------- SCENES ----------------
function setEqValues(prefix, values) {
  eqBands.forEach((band, i) => {
    const el = $(`${prefix}Eq${band}`);
    if (el) {
      el.value = values[i];
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}

function applySceneSettings(scene) {
  if (scene === "fog") {
    controlState.master.filter = 44;
    controlState.acid.filter = 58;
    controlState.drum.filter = 64;
    controlState.flute.filter = 55;
    controlState.electro.filter = 52;
    controlState.bass.filter = 30;

    setEqValues("acid", [2, 2, 1, 2, 1, -1]);
    setEqValues("drum", [2, 1, 0, -1, -2, -2]);
    setEqValues("flute", [0, 2, 3, 1, 2, 1]);
    setEqValues("electro", [0, 0, 2, 4, 5, 2]);
    setEqValues("bass", [4, 2, -1, -3, -4, -4]);
  }

  if (scene === "glass") {
    controlState.master.filter = 62;
    controlState.acid.filter = 68;
    controlState.drum.filter = 72;
    controlState.flute.filter = 70;
    controlState.electro.filter = 74;
    controlState.bass.filter = 36;

    setEqValues("acid", [1, 1, 2, 4, 5, 2]);
    setEqValues("drum", [0, -1, 1, 2, 1, 0]);
    setEqValues("flute", [-2, 0, 3, 5, 6, 4]);
    setEqValues("electro", [-1, 1, 3, 5, 6, 3]);
    setEqValues("bass", [2, 1, -2, -4, -5, -5]);
  }

  if (scene === "underground") {
    controlState.master.filter = 32;
    controlState.acid.filter = 44;
    controlState.drum.filter = 56;
    controlState.flute.filter = 42;
    controlState.electro.filter = 34;
    controlState.bass.filter = 26;

    setEqValues("acid", [5, 4, 1, -1, -2, -3]);
    setEqValues("drum", [5, 3, 1, -2, -3, -4]);
    setEqValues("flute", [-3, -1, 1, 0, -1, -2]);
    setEqValues("electro", [3, 2, 1, 0, -1, -2]);
    setEqValues("bass", [6, 5, 2, -2, -4, -5]);
  }

  if (scene === "pulse") {
    controlState.master.filter = 56;
    controlState.acid.filter = 64;
    controlState.drum.filter = 68;
    controlState.flute.filter = 60;
    controlState.electro.filter = 58;
    controlState.bass.filter = 34;

    setEqValues("acid", [4, 2, 2, 3, 2, 0]);
    setEqValues("drum", [6, 4, 1, -2, -3, -4]);
    setEqValues("flute", [0, 1, 2, 1, 0, -1]);
    setEqValues("electro", [2, 2, 3, 4, 3, 1]);
    setEqValues("bass", [7, 4, 0, -3, -4, -5]);
  }

  applyAllStoredControls();
}

applySceneButton.addEventListener("click", () => {
  applySceneSettings(sceneSelect.value);
});

// ---------------- SOURCE START ----------------
function startSourcesOnce() {
  if (sourcesStarted) return;

  fluteNoise.start();
  fluteOsc.start();
  fluteVibrato.start();

  electroOsc1.start();
  electroOsc2.start();
  electroLfo.start();

  bassOsc1.start();
  bassOsc2.start();

  floorNoise.start();

  Tone.Transport.bpm.value = Number(bpmSlider.value);
  Tone.Transport.swing = Number(swingSlider.value) / 100;
  Tone.Transport.swingSubdivision = "8n";

  if (transportRepeatId === null) {
    transportRepeatId = Tone.Transport.scheduleRepeat((time) => {
      runStep(time);
    }, "8n");
  }

  Tone.Transport.start();
  sourcesStarted = true;
}

startButton.addEventListener("click", async () => {
  if (audioStarted) return;
  await Tone.start();
  await masterReverb.ready;
  startSourcesOnce();

  audioStarted = true;
  startButton.textContent = "Audio Ready";

  applyAllStoredControls();
  applyMasterFx();
  applyTweaks();
  applyMix();
  applySceneSettings(sceneSelect.value);
});

// ---------------- SOUND TOGGLES ----------------
function setSoundState(target, isOn, button) {
  if (target === "acid") acidOn = isOn;
  if (target === "drum") drumOn = isOn;
  if (target === "flute") fluteOn = isOn;
  if (target === "electro") electroOn = isOn;
  if (target === "bass") bassOn = isOn;

  const gainNode = getGainNode(target);

  if (isOn) {
    gainNode.gain.value = getBaseGain(target);
    button.textContent = "ON";
    button.classList.add("active");
  } else {
    gainNode.gain.value = 0;
    button.textContent = "OFF";
    button.classList.remove("active");
  }
}

textureEButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setSoundState("acid", !acidOn, textureEButton);
});

textureBButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setSoundState("drum", !drumOn, textureBButton);
});

textureAButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setSoundState("flute", !fluteOn, textureAButton);
});

textureCButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setSoundState("electro", !electroOn, textureCButton);
});

textureDButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setSoundState("bass", !bassOn, textureDButton);
});

playAllButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setSoundState("acid", true, textureEButton);
  setSoundState("drum", true, textureBButton);
  setSoundState("flute", true, textureAButton);
  setSoundState("electro", true, textureCButton);
  setSoundState("bass", true, textureDButton);
});

stopAllButton.addEventListener("click", () => {
  setSoundState("acid", false, textureEButton);
  setSoundState("drum", false, textureBButton);
  setSoundState("flute", false, textureAButton);
  setSoundState("electro", false, textureCButton);
  setSoundState("bass", false, textureDButton);
  stopAllLoops();
});

// ---------------- MAIN CONTROLS ----------------
controlTargetSelect.addEventListener("change", syncControlSlidersToTarget);

volumeSlider.addEventListener("input", () => {
  const target = controlTargetSelect.value;
  controlState[target].volume = Number(volumeSlider.value);
  applyStoredVolume(target);
});

filterSlider.addEventListener("input", () => {
  const target = controlTargetSelect.value;
  controlState[target].filter = Number(filterSlider.value);
  applyStoredFilter(target);
});

speedSlider.addEventListener("input", () => {
  const target = controlTargetSelect.value;
  controlState[target].speed = Number(speedSlider.value);
  applyStoredSpeed(target);
});

distortionSlider.addEventListener("input", () => {
  const target = controlTargetSelect.value;
  controlState[target].distortion = Number(distortionSlider.value);
  applyStoredDistortion(target);
});

// ---------------- MUSIC ENGINE ----------------
bpmSlider.addEventListener("input", () => {
  bpmValue.textContent = `${bpmSlider.value} BPM`;
  Tone.Transport.bpm.rampTo(Number(bpmSlider.value), 0.05);
});

swingSlider.addEventListener("input", () => {
  swingValue.textContent = `${swingSlider.value}%`;
  Tone.Transport.swing = Number(swingSlider.value) / 100;
});

modDepthSlider.addEventListener("input", () => {
  modDepthValue.textContent = `${modDepthSlider.value}%`;
});

drumTestButton.addEventListener("click", async () => {
  if (!audioStarted) {
    await Tone.start();
    await masterReverb.ready;
    startSourcesOnce();
    audioStarted = true;
    startButton.textContent = "Audio Ready";
  }

  drumGain.gain.value = getBaseGain("drum");
  kickSynth.triggerAttackRelease("C1", "8n", undefined, 0.98);
  setTimeout(() => snareNoise.triggerAttackRelease("16n", undefined, 0.75), 120);
  setTimeout(() => hatSynth.triggerAttackRelease("16n", undefined, 0.35), 170);
});

// ---------------- GLITCH ----------------
function syncGlitchLabels() {
  glitchChanceValue.textContent = `${glitchChanceSlider.value}%`;
  glitchRateValue.textContent = glitchRateSlider.value;
  glitchPitchValue.textContent = `${glitchPitchSlider.value}%`;
  glitchToneValue.textContent = `${glitchToneSlider.value}%`;
}

[glitchChanceSlider, glitchRateSlider, glitchPitchSlider, glitchToneSlider].forEach((el) => {
  el.addEventListener("input", syncGlitchLabels);
});

toggleAutoGlitchButton.addEventListener("click", () => {
  autoGlitchEnabled = !autoGlitchEnabled;
  toggleAutoGlitchButton.textContent = autoGlitchEnabled ? "Auto Glitch On" : "Auto Glitch Off";
});

function triggerGlitchBurst(time = Tone.now()) {
  const pitchAmt = Number(glitchPitchSlider.value) / 100;
  const toneAmt = Number(glitchToneSlider.value) / 100;

  if (electroOn) {
    const base = electroOsc1.frequency.value;
    electroOsc1.frequency.setValueAtTime(base * (1 + pitchAmt * 0.4), time);
    electroOsc2.frequency.setValueAtTime((base + 6) * (1 - pitchAmt * 0.2), time);
    electroFilter.frequency.setValueAtTime(600 + toneAmt * 2600, time);
  }

  if (acidOn) {
    acidFilter.frequency.setValueAtTime(220 + toneAmt * 2800, time);
    acidFilter.Q.value = 10 + toneAmt * 15;
  }

  if (drumOn) {
    hatSynth.triggerAttackRelease("16n", time, 0.6);
    percSynth.triggerAttackRelease("G2", "16n", time + 0.015, 0.55);
  }

  setTimeout(() => {
    applyStoredFilter("electro");
    applyStoredFilter("acid");
  }, 120 + Number(glitchRateSlider.value) * 16);
}

triggerGlitchButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  triggerGlitchBurst();
});

// ---------------- LOOPS ----------------
function validateLoop(loopObj) {
  const interval = Number(loopObj.interval.value);
  const duration = Number(loopObj.duration.value);

  if (Number.isNaN(interval) || Number.isNaN(duration)) {
    loopObj.warning.textContent = "Please enter valid numbers.";
    return false;
  }
  if (interval <= 0 || duration <= 0) {
    loopObj.warning.textContent = "Interval and duration must be positive.";
    return false;
  }
  if (interval <= duration) {
    loopObj.warning.textContent = "Interval must be bigger than duration.";
    return false;
  }

  loopObj.warning.textContent = "";
  return true;
}

[fluteLoop, electroLoop, bassLoop].forEach((loopObj) => {
  [loopObj.interval, loopObj.duration].forEach((el) => {
    el.addEventListener("input", () => validateLoop(loopObj));
  });
});

function getOscillatorGroup(target) {
  if (target === "flute") {
    return { oscillators: [fluteOsc], baseFrequencies: [660 * (controlState.flute.speed / 100)] };
  }
  if (target === "electro") {
    return {
      oscillators: [electroOsc1, electroOsc2],
      baseFrequencies: [220 * (controlState.electro.speed / 100), 224 * (controlState.electro.speed / 100)]
    };
  }
  if (target === "bass") {
    return {
      oscillators: [bassOsc1, bassOsc2],
      baseFrequencies: [55 * (controlState.bass.speed / 100), 55.5 * (controlState.bass.speed / 100)]
    };
  }
  return null;
}

function triggerLoopEffectForSound(soundName, effectName, durationValue) {
  if (!requireSound(soundName)) return;

  if (effectName === "hitUp") {
    const group = getOscillatorGroup(soundName);
    if (!group) return;
    group.oscillators.forEach((osc, i) => (osc.frequency.value = group.baseFrequencies[i] * 1.8));
    setTimeout(() => {
      group.oscillators.forEach((osc, i) => (osc.frequency.value = group.baseFrequencies[i]));
    }, durationValue * 1000);
  }

  if (effectName === "hitDown") {
    const group = getOscillatorGroup(soundName);
    if (!group) return;
    group.oscillators.forEach((osc, i) => (osc.frequency.value = group.baseFrequencies[i] * 0.45));
    setTimeout(() => {
      group.oscillators.forEach((osc, i) => (osc.frequency.value = group.baseFrequencies[i]));
    }, durationValue * 1000);
  }

  if (effectName === "warp") {
    const group = getOscillatorGroup(soundName);
    if (!group) return;
    group.oscillators.forEach((osc, i) => (osc.frequency.value = group.baseFrequencies[i] * 1.55));
    setTimeout(() => {
      group.oscillators.forEach((osc, i) => (osc.frequency.value = group.baseFrequencies[i] * 0.78));
    }, durationValue * 500);
    setTimeout(() => {
      group.oscillators.forEach((osc, i) => (osc.frequency.value = group.baseFrequencies[i]));
    }, durationValue * 1000);
  }

  if (effectName === "muffle") {
    const filterNode = getFilterNode(soundName);
    const normalFreq = filterNode.frequency.value;
    filterNode.frequency.value = 220;
    setTimeout(() => {
      filterNode.frequency.value = normalFreq;
    }, durationValue * 1000);
  }

  if (effectName === "echoBurst") {
    const gainNode = getGainNode(soundName);
    const normalGain = getBaseGain(soundName);
    gainNode.gain.value = normalGain * 1.45;
    setTimeout(() => {
      gainNode.gain.value = normalGain;
    }, durationValue * 1000);
  }
}

function stopLoop(name) {
  if (name === "flute" && fluteLoopId) {
    clearInterval(fluteLoopId);
    fluteLoopId = null;
  }
  if (name === "electro" && electroLoopId) {
    clearInterval(electroLoopId);
    electroLoopId = null;
  }
  if (name === "bass" && bassLoopId) {
    clearInterval(bassLoopId);
    bassLoopId = null;
  }
}

function stopAllLoops() {
  stopLoop("flute");
  stopLoop("electro");
  stopLoop("bass");
}

function startLoop(name, soundName, loopConfig) {
  if (!audioStarted) {
    alert("First click Start Audio");
    return;
  }
  if (!validateLoop(loopConfig)) return;

  stopLoop(name);

  const effectName = loopConfig.effect.value;
  const intervalSeconds = Number(loopConfig.interval.value);
  const durationSeconds = Number(loopConfig.duration.value);

  triggerLoopEffectForSound(soundName, effectName, durationSeconds);

  const id = setInterval(() => {
    triggerLoopEffectForSound(soundName, effectName, durationSeconds);
  }, intervalSeconds * 1000);

  if (name === "flute") fluteLoopId = id;
  if (name === "electro") electroLoopId = id;
  if (name === "bass") bassLoopId = id;
}

fluteLoop.start.addEventListener("click", () => startLoop("flute", "flute", fluteLoop));
fluteLoop.stop.addEventListener("click", () => stopLoop("flute"));
electroLoop.start.addEventListener("click", () => startLoop("electro", "electro", electroLoop));
electroLoop.stop.addEventListener("click", () => stopLoop("electro"));
bassLoop.start.addEventListener("click", () => startLoop("bass", "bass", bassLoop));
bassLoop.stop.addEventListener("click", () => stopLoop("bass"));

// ---------------- STEP ENGINE ----------------
function getDrumSeqLen() {
  return Number(drumSeqLength.value);
}

function getAcidSeqLen() {
  return Number(acidSeqLength.value);
}

function currentNotePools() {
  return {
    flute: buildScaleFrequencies(rootSelect.value, scaleSelect.value, 1),
    electro: buildScaleFrequencies(rootSelect.value, scaleSelect.value, 0),
    bass: buildScaleFrequencies(rootSelect.value, scaleSelect.value, -1),
    acid: buildScaleFrequencies(rootSelect.value, scaleSelect.value, 0)
  };
}

function runStep(time) {
  const pattern = PATTERN_MAP[patternSelect.value];
  const modDepth = Number(modDepthSlider.value) / 100;
  const pools = currentNotePools();

  const drumStep = stepIndex % getDrumSeqLen();
  const acidStep = stepIndex % getAcidSeqLen();

  highlightCurrentStep(drumKickGrid, drumStep, getDrumSeqLen());
  highlightCurrentStep(drumSnareGrid, drumStep, getDrumSeqLen());
  highlightCurrentStep(drumHatGrid, drumStep, getDrumSeqLen());
  highlightCurrentStep(drumClapGrid, drumStep, getDrumSeqLen());
  highlightCurrentStep(drumPercGrid, drumStep, getDrumSeqLen());
  highlightCurrentStep(acidStepGrid, acidStep, getAcidSeqLen());
  highlightCurrentStep(acidAccentGrid, acidStep, getAcidSeqLen());

  if (drumOn) {
    if (drumPattern.kick[drumStep]) {
      kickSynth.triggerAttackRelease(drumStep % 8 === 4 ? "A0" : "C1", "8n", time, 1.0);
    }
    if (drumPattern.snare[drumStep]) {
      snareNoise.triggerAttackRelease("16n", time + 0.001, 0.7);
    }
    if (drumPattern.hat[drumStep]) {
      hatSynth.triggerAttackRelease("16n", time + 0.002, 0.38);
    }
    if (drumPattern.clap[drumStep]) {
      clapNoise.triggerAttackRelease("16n", time + 0.003, 0.55);
    }
    if (drumPattern.perc[drumStep]) {
      percSynth.triggerAttackRelease("G2", "16n", time + 0.004, 0.6);
    }
  }

  if (acidOn && acidPattern.steps[acidStep]) {
    const freq = pools.acid[(acidStep + stepIndex) % pools.acid.length];
    const accented = acidPattern.accent[acidStep];
    const slide = Number(acidSlideSlider.value) / 100;
    const envAmt = Number(acidEnvSlider.value) / 100;
    const baseCutoff = 180 + (Number(acidCutoffSlider.value) / 100) * 3000;

    acidFilter.frequency.value = baseCutoff + envAmt * 1200;
    acidFilter.Q.value = 6 + Number(acidResSlider.value) / 4;

    if (slide > 0.05) {
      acidSynth.frequency.rampTo(freq, 0.02 + slide * 0.08);
    }

    acidSynth.triggerAttackRelease(freq, "16n", time, accented ? 1 : 0.8);
    pulseGain(acidGain, getBaseGain("acid"), time, accented ? 1.55 : 1.2, 0.12);
  }

  if (bassOn && pattern.bass[stepIndex]) {
    const freq = pools.bass[stepIndex % pools.bass.length];
    bassOsc1.frequency.setValueAtTime(freq, time);
    bassOsc2.frequency.setValueAtTime(freq * 1.01, time);
    pulseGain(bassGain, getBaseGain("bass"), time, 1.35, 0.18);
  }

  if (electroOn && pattern.electro[stepIndex]) {
    const freq = pools.electro[(stepIndex + 2) % pools.electro.length];
    electroOsc1.frequency.setValueAtTime(freq, time);
    electroOsc2.frequency.setValueAtTime(freq * (1.004 + modDepth * 0.01), time);
    pulseGain(electroGain, getBaseGain("electro"), time, 1.22, 0.14);
  }

  if (fluteOn && pattern.flute[stepIndex]) {
    const freq = pools.flute[(stepIndex + 1) % pools.flute.length];
    fluteOsc.frequency.setValueAtTime(freq, time);
    pulseGain(fluteGain, getBaseGain("flute"), time, 1.16, 0.20);
  }

  if (autoGlitchEnabled) {
    const chance = Number(glitchChanceSlider.value) / 100;
    if (Math.random() < chance * 0.18) {
      triggerGlitchBurst(time);
    }
  }

  stepIndex = (stepIndex + 1) % 16;
}

// ---------------- OSC / SPEC ----------------
pauseOscilloscopeButton.addEventListener("click", () => {
  oscilloscopePaused = true;
});

resumeOscilloscopeButton.addEventListener("click", () => {
  oscilloscopePaused = false;
  oscilloscopeHold = false;
});

holdOscilloscopeButton.addEventListener("click", () => {
  oscilloscopeHold = !oscilloscopeHold;
});

resetOscilloscopeZoomButton.addEventListener("click", () => {
  oscZoomX.value = 1;
  oscZoomY.value = 2;
  oscGlowAmount.value = 65;
  oscTrailAmount.value = 18;
  oscLineSize.value = 3;
});

toggleOscilloscopeGridButton.addEventListener("click", () => {
  oscilloscopeGrid = !oscilloscopeGrid;
});

pauseSpectrogramButton.addEventListener("click", () => {
  spectrogramPaused = true;
});

resumeSpectrogramButton.addEventListener("click", () => {
  spectrogramPaused = false;
});

clearSpectrogramButton.addEventListener("click", () => {
  spectrogramCtx.fillStyle = "black";
  spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);
  drawSpectrogramOverlay();
});

function fftToColor(value) {
  const intensity = Math.max(0, Math.min(1, (value + 140) / 140));
  if (intensity < 0.2) return `rgb(0,0,${Math.floor(80 + intensity * 200)})`;
  if (intensity < 0.4) return `rgb(0,${Math.floor(intensity * 255)},160)`;
  if (intensity < 0.65) return `rgb(${Math.floor(intensity * 180)},${Math.floor(120 + intensity * 100)},80)`;
  if (intensity < 0.85) return `rgb(${Math.floor(180 + intensity * 60)},${Math.floor(120 + intensity * 80)},40)`;
  return `rgb(255,255,${Math.floor(150 + intensity * 80)})`;
}

function drawSpectrogramOverlay() {
  const width = spectrogramOverlayCanvas.width;
  const height = spectrogramOverlayCanvas.height;

  spectrogramOverlayCtx.clearRect(0, 0, width, height);
  spectrogramOverlayCtx.save();
  spectrogramOverlayCtx.strokeStyle = "rgba(255,255,255,0.14)";
  spectrogramOverlayCtx.fillStyle = "rgba(255,255,255,0.55)";
  spectrogramOverlayCtx.lineWidth = 1;
  spectrogramOverlayCtx.font = "12px Arial";

  for (let i = 0; i <= spectrogramSecondsVisible; i++) {
    const x = (width / spectrogramSecondsVisible) * i;
    spectrogramOverlayCtx.beginPath();
    spectrogramOverlayCtx.moveTo(x, 0);
    spectrogramOverlayCtx.lineTo(x, height);
    spectrogramOverlayCtx.stroke();

    const secondsAgo = spectrogramSecondsVisible - i;
    const label = secondsAgo === 0 ? "now" : `-${secondsAgo}s`;
    spectrogramOverlayCtx.fillText(label, x + 4, 14);
  }

  spectrogramOverlayCtx.restore();
}

function drawSpectrogram() {
  requestAnimationFrame(drawSpectrogram);

  if (spectrogramPaused) {
    drawSpectrogramOverlay();
    return;
  }

  const values = fftAnalyser.getValue();
  const width = spectrogramCanvas.width;
  const height = spectrogramCanvas.height;

  spectrogramCtx.drawImage(
    spectrogramCanvas,
    2, 0, width - 2, height,
    0, 0, width - 2, height
  );

  spectrogramCtx.fillStyle = "rgba(0,0,0,0.18)";
  spectrogramCtx.fillRect(width - 2, 0, 2, height);

  const binsToUse = Math.floor(values.length * 0.6);
  const binHeight = height / binsToUse;

  for (let i = 0; i < binsToUse; i++) {
    const y = height - (i + 1) * binHeight;
    spectrogramCtx.fillStyle = fftToColor(values[i]);
    spectrogramCtx.fillRect(width - 2, y, 2, Math.ceil(binHeight) + 1);
  }

  drawSpectrogramOverlay();
}

function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);

  if (oscilloscopePaused || oscilloscopeHold) return;

  const waveform = waveformAnalyser.getValue();
  const width = oscilloscopeCanvas.width;
  const height = oscilloscopeCanvas.height;
  const centerY = height / 2;

  const zoomX = Number(oscZoomX.value);
  const zoomY = Number(oscZoomY.value);
  const glow = Number(oscGlowAmount.value);
  const trail = Number(oscTrailAmount.value);
  const lineSize = Number(oscLineSize.value);

  const fadeAlpha = 0.03 + (100 - trail) / 100 * 0.35;
  oscilloscopeCtx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
  oscilloscopeCtx.fillRect(0, 0, width, height);

  if (oscilloscopeGrid) {
    oscilloscopeCtx.save();
    oscilloscopeCtx.strokeStyle = "rgba(120,120,120,0.18)";
    oscilloscopeCtx.lineWidth = 1;
    for (let i = 0; i <= 12; i++) {
      const x = (width / 12) * i;
      oscilloscopeCtx.beginPath();
      oscilloscopeCtx.moveTo(x, 0);
      oscilloscopeCtx.lineTo(x, height);
      oscilloscopeCtx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const y = (height / 6) * i;
      oscilloscopeCtx.beginPath();
      oscilloscopeCtx.moveTo(0, y);
      oscilloscopeCtx.lineTo(width, y);
      oscilloscopeCtx.stroke();
    }
    oscilloscopeCtx.restore();
  }

  const samplesToShow = Math.max(128, Math.floor(waveform.length / zoomX));
  const startIndex = Math.floor((waveform.length - samplesToShow) / 2);
  const visibleWaveform = waveform.slice(startIndex, startIndex + samplesToShow);
  const sliceWidth = width / visibleWaveform.length;

  oscilloscopeCtx.save();
  oscilloscopeCtx.beginPath();
  oscilloscopeCtx.lineWidth = lineSize + 4;
  oscilloscopeCtx.strokeStyle = `rgba(124,255,124,${0.08 + glow / 400})`;
  oscilloscopeCtx.shadowBlur = 6 + glow / 3;
  oscilloscopeCtx.shadowColor = "#8cff6d";

  let x = 0;
  for (let i = 0; i < visibleWaveform.length; i++) {
    const y = centerY + visibleWaveform[i] * (height * 0.16 * zoomY);
    if (i === 0) oscilloscopeCtx.moveTo(x, y);
    else oscilloscopeCtx.lineTo(x, y);
    x += sliceWidth;
  }
  oscilloscopeCtx.stroke();
  oscilloscopeCtx.restore();

  oscilloscopeCtx.save();
  oscilloscopeCtx.beginPath();
  oscilloscopeCtx.lineWidth = lineSize;
  oscilloscopeCtx.strokeStyle = "#b8ff99";

  x = 0;
  for (let i = 0; i < visibleWaveform.length; i++) {
    const y = centerY + visibleWaveform[i] * (height * 0.16 * zoomY);
    if (i === 0) oscilloscopeCtx.moveTo(x, y);
    else oscilloscopeCtx.lineTo(x, y);
    x += sliceWidth;
  }
  oscilloscopeCtx.stroke();
  oscilloscopeCtx.restore();
}

// ---------------- INIT ----------------
syncControlSlidersToTarget();
applyMasterFx();
applyTweaks();
applyMix();
syncGlitchLabels();

bpmValue.textContent = `${bpmSlider.value} BPM`;
swingValue.textContent = `${swingSlider.value}%`;
modDepthValue.textContent = `${modDepthSlider.value}%`;

oscilloscopeCtx.fillStyle = "black";
oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

spectrogramCtx.fillStyle = "black";
spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);
drawSpectrogramOverlay();

drawOscilloscope();
drawSpectrogram();
