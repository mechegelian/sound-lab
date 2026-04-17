const $ = (id) => document.getElementById(id);

// ---------------- BASIC UI ----------------
const startButton = $("startButton");
const playAllButton = $("playAllButton");
const stopAllButton = $("stopAllButton");
const randomButton = $("randomButton");

const presetFog = $("presetFog");
const presetGlass = $("presetGlass");
const presetUnderground = $("presetUnderground");
const presetPunch = $("presetPunch");

const textureAButton = $("textureAButton");
const textureBButton = $("textureBButton");
const textureCButton = $("textureCButton");
const textureDButton = $("textureDButton");

const controlTargetSelect = $("controlTargetSelect");
const volumeSlider = $("volumeSlider");
const filterSlider = $("filterSlider");
const speedSlider = $("speedSlider");
const distortionSlider = $("distortionSlider");

const masterReverbSlider = $("masterReverbSlider");
const masterDelaySlider = $("masterDelaySlider");
const masterWidthSlider = $("masterWidthSlider");
const masterOutputSlider = $("masterOutputSlider");

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
const crushSlider = $("crushSlider");
const crushValue = $("crushValue");
const stretchSlider = $("stretchSlider");
const stretchValue = $("stretchValue");
const motionSlider = $("motionSlider");
const motionValue = $("motionValue");
const blurSlider = $("blurSlider");
const blurValue = $("blurValue");
const flutterSlider = $("flutterSlider");
const flutterValue = $("flutterValue");

// ---------------- MIX ----------------
const dryWetSlider = $("dryWetSlider");
const dryWetValue = $("dryWetValue");
const glueSlider = $("glueSlider");
const glueValue = $("glueValue");
const widthMixSlider = $("widthMixSlider");
const widthMixValue = $("widthMixValue");
const punchSlider = $("punchSlider");
const punchValue = $("punchValue");
const airSlider = $("airSlider");
const airValue = $("airValue");
const lowWeightSlider = $("lowWeightSlider");
const lowWeightValue = $("lowWeightValue");
const noiseFloorSlider = $("noiseFloorSlider");
const noiseFloorValue = $("noiseFloorValue");
const crossmixSlider = $("crossmixSlider");
const crossmixValue = $("crossmixValue");

// ---------------- GLOBAL STATE ----------------
let audioStarted = false;
let sourcesStarted = false;

let fluteOn = false;
let drumOn = false;
let electroOn = false;
let bassOn = false;

let oscilloscopePaused = false;
let oscilloscopeHold = false;
let oscilloscopeGrid = true;
let spectrogramPaused = false;

let fluteLoopId = null;
let drumLoopId = null;
let electroLoopId = null;
let bassLoopId = null;

const spectrogramSecondsVisible = 8;

// ---------------- AUDIO ----------------
const waveformAnalyser = new Tone.Waveform(2048);
const fftAnalyser = new Tone.FFT(256);

const masterGain = new Tone.Gain(0.75);
const masterFilter = new Tone.Filter(1800, "lowpass");
const masterLowShelf = new Tone.Filter(140, "lowshelf");
const masterHighShelf = new Tone.Filter(7000, "highshelf");
const masterDistortion = new Tone.Distortion(0);
const masterWidth = new Tone.StereoWidener(0.5);
const masterDelay = new Tone.FeedbackDelay(0.25, 0.25);
const masterReverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.01 });
const masterCompressor = new Tone.Compressor(-18, 3);
const floorNoise = new Tone.Noise("pink");
const floorNoiseGain = new Tone.Gain(0);

masterDelay.wet.value = 0.1;
masterReverb.wet.value = 0.2;

// flute
const fluteGain = new Tone.Gain(0);
const fluteFilter = new Tone.Filter(1800, "bandpass");
const fluteDistortion = new Tone.Distortion(0);
const fluteNoise = new Tone.Noise("pink");
const fluteNoiseGain = new Tone.Gain(0.08);
const fluteOsc = new Tone.Oscillator(660, "triangle");
const fluteVibrato = new Tone.LFO(5, -10, 10);

// drum
const drumGain = new Tone.Gain(0);
const drumFilter = new Tone.Filter(900, "lowpass");
const drumDistortion = new Tone.Distortion(0.05);
const drumSynth = new Tone.MembraneSynth({
  pitchDecay: 0.03,
  octaves: 5,
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.001,
    decay: 0.35,
    sustain: 0,
    release: 0.05
  }
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
const bassFilter = new Tone.Filter(220, "lowpass");
const bassDistortion = new Tone.Distortion(0.03);
const bassOsc1 = new Tone.Oscillator(55, "sawtooth");
const bassOsc2 = new Tone.Oscillator(55.5, "square");

// ---------------- EQ ----------------
const eqBands = ["60", "250", "1000", "4000", "8000", "15000"];

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

const fluteEq = createSixBandEq();
const drumEq = createSixBandEq();
const electroEq = createSixBandEq();
const bassEq = createSixBandEq();

const fluteEqOut = new Tone.Gain(1);
const drumEqOut = new Tone.Gain(1);
const electroEqOut = new Tone.Gain(1);
const bassEqOut = new Tone.Gain(1);

// ---------------- CONNECT ----------------
fluteNoise.connect(fluteNoiseGain);
fluteNoiseGain.connect(fluteFilter);
fluteOsc.connect(fluteFilter);
fluteVibrato.connect(fluteOsc.detune);
fluteFilter.connect(fluteDistortion);
chainSixBandEq(fluteEq, fluteDistortion, fluteEqOut);
fluteEqOut.connect(fluteGain);

drumSynth.connect(drumFilter);
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

// master chain
fluteGain.connect(masterFilter);
drumGain.connect(masterFilter);
electroGain.connect(masterFilter);
bassGain.connect(masterFilter);
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

// ---------------- HELPERS ----------------
function sliderToGain(target, value) {
  if (target === "master") return value / 100;
  return value / 160;
}

function sliderToFrequency(value) {
  const minFreq = 120;
  const maxFreq = 5000;
  return minFreq + (value / 100) * (maxFreq - minFreq);
}

function getGainNode(target) {
  return {
    master: masterGain,
    flute: fluteGain,
    drum: drumGain,
    electro: electroGain,
    bass: bassGain
  }[target];
}

function getFilterNode(target) {
  return {
    master: masterFilter,
    flute: fluteFilter,
    drum: drumFilter,
    electro: electroFilter,
    bass: bassFilter
  }[target];
}

function getDistortionNode(target) {
  return {
    master: masterDistortion,
    flute: fluteDistortion,
    drum: drumDistortion,
    electro: electroDistortion,
    bass: bassDistortion
  }[target];
}

function isSoundOn(target) {
  return (
    (target === "flute" && fluteOn) ||
    (target === "drum" && drumOn) ||
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ---------------- CONTROL STATE ----------------
const controlState = {
  master: { volume: 75, filter: 50, speed: 100, distortion: 0 },
  flute: { volume: 70, filter: 55, speed: 100, distortion: 0 },
  drum: { volume: 75, filter: 45, speed: 100, distortion: 5 },
  electro: { volume: 68, filter: 60, speed: 100, distortion: 12 },
  bass: { volume: 72, filter: 30, speed: 100, distortion: 5 }
};

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
    gainNode.gain.value = sliderToGain(target, value) * getCrossmixMultiplier(target);
  }
}

function applyStoredFilter(target) {
  const value = controlState[target].filter;
  const freq = sliderToFrequency(value);

  if (target === "master") {
    masterFilter.frequency.value = Math.max(120, freq - Number(blurSlider?.value || 0) * 10);
    return;
  }

  const filterNode = getFilterNode(target);
  if (filterNode) {
    filterNode.frequency.value = freq;
  }
}

function applyStoredDistortion(target) {
  const node = getDistortionNode(target);
  if (!node) return;
  node.distortion = controlState[target].distortion / 100;
}

function applyStoredSpeed(target) {
  const mult = controlState[target].speed / 100;
  const stretch = 1 + (Number(stretchSlider?.value || 0) / 200);

  if (target === "flute") {
    fluteOsc.frequency.value = 660 * mult / stretch;
    fluteVibrato.frequency.value = 5 * (1 + Number(motionSlider?.value || 0) / 100);
  }

  if (target === "electro") {
    electroOsc1.frequency.value = 220 * mult / stretch;
    electroOsc2.frequency.value = 224 * mult / stretch;
    electroLfo.frequency.value = 0.25 + Number(motionSlider?.value || 0) / 200;
  }

  if (target === "bass") {
    bassOsc1.frequency.value = 55 * mult / stretch;
    bassOsc2.frequency.value = 55.5 * mult / stretch;
  }
}

function applyAllStoredControls() {
  ["master", "flute", "drum", "electro", "bass"].forEach((target) => {
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
});

// ---------------- SOUND TOGGLES ----------------
function setFluteState(isOn) {
  fluteOn = isOn;
  if (isOn) {
    fluteGain.gain.value = sliderToGain("flute", controlState.flute.volume) * getCrossmixMultiplier("flute");
    textureAButton.textContent = "ON";
    textureAButton.classList.add("active");
  } else {
    fluteGain.gain.value = 0;
    textureAButton.textContent = "OFF";
    textureAButton.classList.remove("active");
  }
}

function setDrumState(isOn) {
  drumOn = isOn;
  if (isOn) {
    drumGain.gain.value = sliderToGain("drum", controlState.drum.volume) * getCrossmixMultiplier("drum");
    textureBButton.textContent = "ON";
    textureBButton.classList.add("active");
  } else {
    drumGain.gain.value = 0;
    textureBButton.textContent = "OFF";
    textureBButton.classList.remove("active");
  }
}

function setElectroState(isOn) {
  electroOn = isOn;
  if (isOn) {
    electroGain.gain.value = sliderToGain("electro", controlState.electro.volume) * getCrossmixMultiplier("electro");
    textureCButton.textContent = "ON";
    textureCButton.classList.add("active");
  } else {
    electroGain.gain.value = 0;
    textureCButton.textContent = "OFF";
    textureCButton.classList.remove("active");
  }
}

function setBassState(isOn) {
  bassOn = isOn;
  if (isOn) {
    bassGain.gain.value = sliderToGain("bass", controlState.bass.volume) * getCrossmixMultiplier("bass");
    textureDButton.textContent = "ON";
    textureDButton.classList.add("active");
  } else {
    bassGain.gain.value = 0;
    textureDButton.textContent = "OFF";
    textureDButton.classList.remove("active");
  }
}

textureAButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setFluteState(!fluteOn);
});

textureBButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setDrumState(!drumOn);
});

textureCButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setElectroState(!electroOn);
});

textureDButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setBassState(!bassOn);
});

playAllButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");
  setFluteState(true);
  setDrumState(true);
  setElectroState(true);
  setBassState(true);
});

stopAllButton.addEventListener("click", () => {
  setFluteState(false);
  setDrumState(false);
  setElectroState(false);
  setBassState(false);
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

// ---------------- EQ HELPERS ----------------
function getEqElements(prefix) {
  const out = {};
  eqBands.forEach((band) => {
    out[band] = $(`${prefix}Eq${band}`);
  });
  return out;
}

const fluteEqEls = getEqElements("flute");
const drumEqEls = getEqElements("drum");
const electroEqEls = getEqElements("electro");
const bassEqEls = getEqElements("bass");

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

bindEq(fluteEqEls, fluteEq);
bindEq(drumEqEls, drumEq);
bindEq(electroEqEls, electroEq);
bindEq(bassEqEls, bassEq);

applySixBandEq(fluteEq, readEqValues(fluteEqEls));
applySixBandEq(drumEq, readEqValues(drumEqEls));
applySixBandEq(electroEq, readEqValues(electroEqEls));
applySixBandEq(bassEq, readEqValues(bassEqEls));

// ---------------- EQ UI + GRAPH ----------------
function setupEqUI(config) {
  const toggle = $(config.toggleId);
  const drawer = $(config.drawerId);
  const canvas = $(config.canvasId);
  if (!toggle || !drawer || !canvas) return;

  const ctx = canvas.getContext("2d");
  const sliders = config.sliderIds.map((id) => $(id)).filter(Boolean);

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
    ctx.lineWidth = 1;
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

    const centerY = valueToY(0, height);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
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
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = "#8cff6d";
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
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
    const bandIndex = clamp(Math.floor(x / bandWidth), 0, sliders.length - 1);
    const newValue = clamp(yToValue(y, canvas.height), -12, 12);

    sliders[bandIndex].value = newValue;
    sliders[bandIndex].dispatchEvent(new Event("input", { bubbles: true }));
    draw();
  }

  toggle.addEventListener("click", () => {
    drawer.classList.toggle("open");
    toggle.classList.toggle("active");
    draw();
  });

  sliders.forEach((slider) => {
    slider.addEventListener("input", draw);
  });

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    updateFromPointer(event);
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    updateFromPointer(event);
  });

  draw();
}

setupEqUI({
  toggleId: "fluteEqToggle",
  drawerId: "fluteEqDrawer",
  canvasId: "fluteEqCanvas",
  sliderIds: ["fluteEq60", "fluteEq250", "fluteEq1000", "fluteEq4000", "fluteEq8000", "fluteEq15000"]
});

setupEqUI({
  toggleId: "drumEqToggle",
  drawerId: "drumEqDrawer",
  canvasId: "drumEqCanvas",
  sliderIds: ["drumEq60", "drumEq250", "drumEq1000", "drumEq4000", "drumEq8000", "drumEq15000"]
});

setupEqUI({
  toggleId: "electroEqToggle",
  drawerId: "electroEqDrawer",
  canvasId: "electroEqCanvas",
  sliderIds: ["electroEq60", "electroEq250", "electroEq1000", "electroEq4000", "electroEq8000", "electroEq15000"]
});

setupEqUI({
  toggleId: "bassEqToggle",
  drawerId: "bassEqDrawer",
  canvasId: "bassEqCanvas",
  sliderIds: ["bassEq60", "bassEq250", "bassEq1000", "bassEq4000", "bassEq8000", "bassEq15000"]
});

// ---------------- PRESETS ----------------
const presetButtons = [presetFog, presetGlass, presetUnderground, presetPunch];

function clearPresetActive() {
  presetButtons.forEach((btn) => btn.classList.remove("active"));
}

function setPresetButton(button) {
  clearPresetActive();
  button.classList.add("active");
}

function setEqValues(prefix, values) {
  eqBands.forEach((band, i) => {
    const el = $(`${prefix}Eq${band}`);
    if (el) {
      el.value = values[i];
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
}

presetFog.addEventListener("click", () => {
  setPresetButton(presetFog);

  masterReverbSlider.value = 60;
  masterDelaySlider.value = 18;
  masterWidthSlider.value = 55;
  masterOutputSlider.value = 72;

  oscGlowAmount.value = 78;
  oscTrailAmount.value = 28;
  oscLineSize.value = 3;

  controlState.master.filter = 40;
  applyStoredFilter("master");
  applyMasterFx();

  setEqValues("flute", [0, 2, 3, 1, 2, 1]);
  setEqValues("drum", [1, 0, -1, -2, -2, -1]);
  setEqValues("electro", [0, 0, 2, 4, 5, 2]);
  setEqValues("bass", [4, 2, -1, -3, -4, -4]);

  if (driftSlider) driftSlider.value = driftValue.value = 18;
  if (smearSlider) smearSlider.value = smearValue.value = 35;
  if (grainSlider) grainSlider.value = grainValue.value = 28;
  if (crushSlider) crushSlider.value = crushValue.value = 8;
  if (stretchSlider) stretchSlider.value = stretchValue.value = 22;
  if (motionSlider) motionSlider.value = motionValue.value = 26;
  if (blurSlider) blurSlider.value = blurValue.value = 32;
  if (flutterSlider) flutterSlider.value = flutterValue.value = 10;

  if (dryWetSlider) dryWetSlider.value = dryWetValue.value = 42;
  if (glueSlider) glueSlider.value = glueValue.value = 28;
  if (widthMixSlider) widthMixSlider.value = widthMixValue.value = 56;
  if (punchSlider) punchSlider.value = punchValue.value = 26;
  if (airSlider) airSlider.value = airValue.value = 24;
  if (lowWeightSlider) lowWeightSlider.value = lowWeightValue.value = 42;
  if (noiseFloorSlider) noiseFloorSlider.value = noiseFloorValue.value = 10;
  if (crossmixSlider) crossmixSlider.value = crossmixValue.value = 18;

  applyTweaks();
  applyMix();
});

presetGlass.addEventListener("click", () => {
  setPresetButton(presetGlass);

  masterReverbSlider.value = 34;
  masterDelaySlider.value = 15;
  masterWidthSlider.value = 72;
  masterOutputSlider.value = 75;

  oscGlowAmount.value = 85;
  oscTrailAmount.value = 15;
  oscLineSize.value = 2;

  controlState.master.filter = 62;
  applyStoredFilter("master");
  applyMasterFx();

  setEqValues("flute", [-2, 0, 3, 5, 6, 4]);
  setEqValues("drum", [0, -1, 1, 2, 1, 0]);
  setEqValues("electro", [-1, 1, 3, 5, 6, 3]);
  setEqValues("bass", [2, 1, -2, -4, -5, -5]);

  if (driftSlider) driftSlider.value = driftValue.value = 12;
  if (smearSlider) smearSlider.value = smearValue.value = 20;
  if (grainSlider) grainSlider.value = grainValue.value = 18;
  if (crushSlider) crushSlider.value = crushValue.value = 4;
  if (stretchSlider) stretchSlider.value = stretchValue.value = 14;
  if (motionSlider) motionSlider.value = motionValue.value = 18;
  if (blurSlider) blurSlider.value = blurValue.value = 8;
  if (flutterSlider) flutterSlider.value = flutterValue.value = 18;

  if (dryWetSlider) dryWetSlider.value = dryWetValue.value = 32;
  if (glueSlider) glueSlider.value = glueValue.value = 18;
  if (widthMixSlider) widthMixSlider.value = widthMixValue.value = 74;
  if (punchSlider) punchSlider.value = punchValue.value = 18;
  if (airSlider) airSlider.value = airValue.value = 44;
  if (lowWeightSlider) lowWeightSlider.value = lowWeightValue.value = 24;
  if (noiseFloorSlider) noiseFloorSlider.value = noiseFloorValue.value = 4;
  if (crossmixSlider) crossmixSlider.value = crossmixValue.value = 30;

  applyTweaks();
  applyMix();
});

presetUnderground.addEventListener("click", () => {
  setPresetButton(presetUnderground);

  masterReverbSlider.value = 12;
  masterDelaySlider.value = 10;
  masterWidthSlider.value = 38;
  masterOutputSlider.value = 80;

  oscGlowAmount.value = 58;
  oscTrailAmount.value = 22;
  oscLineSize.value = 4;

  controlState.master.filter = 30;
  applyStoredFilter("master");
  applyMasterFx();

  setEqValues("flute", [-3, -1, 1, 0, -1, -2]);
  setEqValues("drum", [5, 3, 0, -2, -3, -4]);
  setEqValues("electro", [3, 2, 1, 0, -1, -2]);
  setEqValues("bass", [6, 5, 2, -2, -4, -5]);

  if (driftSlider) driftSlider.value = driftValue.value = 26;
  if (smearSlider) smearSlider.value = smearValue.value = 30;
  if (grainSlider) grainSlider.value = grainValue.value = 42;
  if (crushSlider) crushSlider.value = crushValue.value = 22;
  if (stretchSlider) stretchSlider.value = stretchValue.value = 20;
  if (motionSlider) motionSlider.value = motionValue.value = 34;
  if (blurSlider) blurSlider.value = blurValue.value = 38;
  if (flutterSlider) flutterSlider.value = flutterValue.value = 14;

  if (dryWetSlider) dryWetSlider.value = dryWetValue.value = 24;
  if (glueSlider) glueSlider.value = glueValue.value = 38;
  if (widthMixSlider) widthMixSlider.value = widthMixValue.value = 34;
  if (punchSlider) punchSlider.value = punchValue.value = 52;
  if (airSlider) airSlider.value = airValue.value = 14;
  if (lowWeightSlider) lowWeightSlider.value = lowWeightValue.value = 68;
  if (noiseFloorSlider) noiseFloorSlider.value = noiseFloorValue.value = 18;
  if (crossmixSlider) crossmixSlider.value = crossmixValue.value = 28;

  applyTweaks();
  applyMix();
});

presetPunch.addEventListener("click", () => {
  setPresetButton(presetPunch);

  masterReverbSlider.value = 8;
  masterDelaySlider.value = 6;
  masterWidthSlider.value = 50;
  masterOutputSlider.value = 82;

  oscGlowAmount.value = 70;
  oscTrailAmount.value = 8;
  oscLineSize.value = 5;

  controlState.master.filter = 55;
  applyStoredFilter("master");
  applyMasterFx();

  setEqValues("flute", [0, 1, 2, 1, 0, -1]);
  setEqValues("drum", [6, 4, 1, -2, -3, -4]);
  setEqValues("electro", [2, 2, 3, 4, 3, 1]);
  setEqValues("bass", [7, 4, 0, -3, -4, -5]);

  if (driftSlider) driftSlider.value = driftValue.value = 10;
  if (smearSlider) smearSlider.value = smearValue.value = 8;
  if (grainSlider) grainSlider.value = grainValue.value = 12;
  if (crushSlider) crushSlider.value = crushValue.value = 6;
  if (stretchSlider) stretchSlider.value = stretchValue.value = 8;
  if (motionSlider) motionSlider.value = motionValue.value = 14;
  if (blurSlider) blurSlider.value = blurValue.value = 6;
  if (flutterSlider) flutterSlider.value = flutterValue.value = 6;

  if (dryWetSlider) dryWetSlider.value = dryWetValue.value = 14;
  if (glueSlider) glueSlider.value = glueValue.value = 30;
  if (widthMixSlider) widthMixSlider.value = widthMixValue.value = 50;
  if (punchSlider) punchSlider.value = punchValue.value = 72;
  if (airSlider) airSlider.value = airValue.value = 18;
  if (lowWeightSlider) lowWeightSlider.value = lowWeightValue.value = 58;
  if (noiseFloorSlider) noiseFloorSlider.value = noiseFloorValue.value = 4;
  if (crossmixSlider) crossmixSlider.value = crossmixValue.value = 12;

  applyTweaks();
  applyMix();
});

// ---------------- LOOPS ----------------
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
const drumLoop = getLoopElements("drum");
const electroLoop = getLoopElements("electro");
const bassLoop = getLoopElements("bass");

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

[
  fluteLoop.interval, fluteLoop.duration,
  drumLoop.interval, drumLoop.duration,
  electroLoop.interval, electroLoop.duration,
  bassLoop.interval, bassLoop.duration
].forEach((el) => {
  el.addEventListener("input", () => {
    validateLoop(fluteLoop);
    validateLoop(drumLoop);
    validateLoop(electroLoop);
    validateLoop(bassLoop);
  });
});

function getOscillatorGroup(target) {
  if (target === "flute") {
    return {
      oscillators: [fluteOsc],
      baseFrequencies: [660 * (controlState.flute.speed / 100)]
    };
  }

  if (target === "electro") {
    return {
      oscillators: [electroOsc1, electroOsc2],
      baseFrequencies: [
        220 * (controlState.electro.speed / 100),
        224 * (controlState.electro.speed / 100)
      ]
    };
  }

  if (target === "bass") {
    return {
      oscillators: [bassOsc1, bassOsc2],
      baseFrequencies: [
        55 * (controlState.bass.speed / 100),
        55.5 * (controlState.bass.speed / 100)
      ]
    };
  }

  return null;
}

function getDrumVelocity() {
  return 0.7 + Number(punchSlider?.value || 0) / 300;
}

function triggerLoopEffectForSound(soundName, effectName, durationValue) {
  if (!requireSound(soundName)) return;

  if (soundName === "drum" && effectName === "echoBurst") {
    drumSynth.triggerAttackRelease("C1", "8n", undefined, getDrumVelocity() + 0.2);
    return;
  }

  if (soundName === "drum" && effectName === "muffle") {
    const normalFreq = drumFilter.frequency.value;
    drumFilter.frequency.value = 180;
    setTimeout(() => {
      drumFilter.frequency.value = normalFreq;
    }, durationValue * 1000);
    return;
  }

  if (soundName === "drum" && (effectName === "hitUp" || effectName === "hitDown" || effectName === "warp")) {
    const note = effectName === "hitDown" ? "A0" : effectName === "warp" ? "D1" : "E1";
    drumSynth.triggerAttackRelease(note, "8n", undefined, getDrumVelocity());
    return;
  }

  if (effectName === "hitUp") {
    const group = getOscillatorGroup(soundName);
    if (!group) return;

    group.oscillators.forEach((osc, i) => {
      osc.frequency.value = group.baseFrequencies[i] * 1.8;
    });

    setTimeout(() => {
      group.oscillators.forEach((osc, i) => {
        osc.frequency.value = group.baseFrequencies[i];
      });
    }, durationValue * 1000);
  }

  if (effectName === "hitDown") {
    const group = getOscillatorGroup(soundName);
    if (!group) return;

    group.oscillators.forEach((osc, i) => {
      osc.frequency.value = group.baseFrequencies[i] * 0.45;
    });

    setTimeout(() => {
      group.oscillators.forEach((osc, i) => {
        osc.frequency.value = group.baseFrequencies[i];
      });
    }, durationValue * 1000);
  }

  if (effectName === "warp") {
    const group = getOscillatorGroup(soundName);
    if (!group) return;

    group.oscillators.forEach((osc, i) => {
      osc.frequency.value = group.baseFrequencies[i] * 1.55;
    });

    setTimeout(() => {
      group.oscillators.forEach((osc, i) => {
        osc.frequency.value = group.baseFrequencies[i] * 0.78;
      });
    }, durationValue * 500);

    setTimeout(() => {
      group.oscillators.forEach((osc, i) => {
        osc.frequency.value = group.baseFrequencies[i];
      });
    }, durationValue * 1000);
  }

  if (effectName === "muffle") {
    const filterNode = getFilterNode(soundName);
    if (!filterNode) return;

    const normalFreq = filterNode.frequency.value;
    filterNode.frequency.value = 220;

    setTimeout(() => {
      filterNode.frequency.value = normalFreq;
    }, durationValue * 1000);
  }

  if (effectName === "echoBurst") {
    const gainNode = getGainNode(soundName);
    if (!gainNode) return;

    const normalGain = sliderToGain(soundName, controlState[soundName].volume) * getCrossmixMultiplier(soundName);
    gainNode.gain.value = normalGain * 1.5;

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
  if (name === "drum" && drumLoopId) {
    clearInterval(drumLoopId);
    drumLoopId = null;
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
  stopLoop("drum");
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
  if (name === "drum") drumLoopId = id;
  if (name === "electro") electroLoopId = id;
  if (name === "bass") bassLoopId = id;
}

fluteLoop.start.addEventListener("click", () => startLoop("flute", "flute", fluteLoop));
fluteLoop.stop.addEventListener("click", () => stopLoop("flute"));

drumLoop.start.addEventListener("click", () => startLoop("drum", "drum", drumLoop));
drumLoop.stop.addEventListener("click", () => stopLoop("drum"));

electroLoop.start.addEventListener("click", () => startLoop("electro", "electro", electroLoop));
electroLoop.stop.addEventListener("click", () => stopLoop("electro"));

bassLoop.start.addEventListener("click", () => startLoop("bass", "bass", bassLoop));
bassLoop.stop.addEventListener("click", () => stopLoop("bass"));

// ---------------- TWEAKS + MIX BINDINGS ----------------
function bindSliderNumber(slider, number, callback) {
  if (!slider || !number) return;

  slider.addEventListener("input", () => {
    number.value = slider.value;
    if (callback) callback();
  });

  number.addEventListener("input", () => {
    const val = clamp(Number(number.value), Number(slider.min), Number(slider.max));
    slider.value = val;
    number.value = val;
    if (callback) callback();
  });
}

function getCrossmixMultiplier(target) {
  const v = Number(crossmixSlider?.value || 0) / 100;

  if (target === "flute") return 1 - v * 0.15;
  if (target === "drum") return 1 + v * 0.12;
  if (target === "electro") return 1 + v * 0.18;
  if (target === "bass") return 1 - v * 0.08;
  return 1;
}

function applyTweaks() {
  const drift = Number(driftSlider?.value || 0);
  const smear = Number(smearSlider?.value || 0);
  const grain = Number(grainSlider?.value || 0);
  const crush = Number(crushSlider?.value || 0);
  const stretch = Number(stretchSlider?.value || 0);
  const motion = Number(motionSlider?.value || 0);
  const blur = Number(blurSlider?.value || 0);
  const flutter = Number(flutterSlider?.value || 0);

  // drift / flutter / motion
  fluteVibrato.min = -10 - drift * 0.4 - flutter * 0.4;
  fluteVibrato.max = 10 + drift * 0.4 + flutter * 0.4;
  fluteVibrato.frequency.value = 5 + motion * 0.06 + flutter * 0.08;

  electroLfo.min = 600 - motion * 6;
  electroLfo.max = 2600 + motion * 8;
  electroLfo.frequency.value = 0.25 + motion * 0.02;

  // grain / noise
  fluteNoiseGain.gain.value = 0.05 + grain / 700;
  floorNoiseGain.gain.value = Number(noiseFloorSlider?.value || 0) / 2000 + grain / 4000;

  // crush
  masterDistortion.distortion = Math.min(0.9, Number(masterOutputSlider?.value || 75) / 2000 + crush / 120);

  // blur
  masterFilter.frequency.value = Math.max(160, sliderToFrequency(controlState.master.filter) - blur * 18);

  // smear / stretch
  masterReverb.decay = 1.2 + smear / 20 + stretch / 40;
  masterDelay.delayTime.value = 0.15 + stretch / 400;
}

function applyMix() {
  const dryWet = Number(dryWetSlider?.value || 0);
  const glue = Number(glueSlider?.value || 0);
  const widthMix = Number(widthMixSlider?.value || 0);
  const punch = Number(punchSlider?.value || 0);
  const air = Number(airSlider?.value || 0);
  const lowWeight = Number(lowWeightSlider?.value || 0);
  const noiseFloor = Number(noiseFloorSlider?.value || 0);

  const wet = dryWet / 100;
  masterReverb.wet.value = wet * 0.75 + Number(masterReverbSlider?.value || 0) / 400;
  masterDelay.wet.value = wet * 0.55 + Number(masterDelaySlider?.value || 0) / 500;

  masterWidth.width.value = Math.min(1, widthMix / 100);

  masterCompressor.threshold.value = -8 - glue * 0.22;
  masterCompressor.ratio.value = 1 + glue / 18;

  masterHighShelf.gain.value = air / 4;
  masterLowShelf.gain.value = lowWeight / 4;

  floorNoiseGain.gain.value = noiseFloor / 1500 + Number(grainSlider?.value || 0) / 4000;

  if (drumOn) {
    drumGain.gain.value = sliderToGain("drum", controlState.drum.volume) * (1 + punch / 250) * getCrossmixMultiplier("drum");
  }
  if (bassOn) {
    bassGain.gain.value = sliderToGain("bass", controlState.bass.volume) * (1 + lowWeight / 300) * getCrossmixMultiplier("bass");
  }
  if (fluteOn) {
    fluteGain.gain.value = sliderToGain("flute", controlState.flute.volume) * getCrossmixMultiplier("flute");
  }
  if (electroOn) {
    electroGain.gain.value = sliderToGain("electro", controlState.electro.volume) * getCrossmixMultiplier("electro");
  }
}

[
  [driftSlider, driftValue, applyTweaks],
  [smearSlider, smearValue, applyTweaks],
  [grainSlider, grainValue, applyTweaks],
  [crushSlider, crushValue, applyTweaks],
  [stretchSlider, stretchValue, applyTweaks],
  [motionSlider, motionValue, applyTweaks],
  [blurSlider, blurValue, applyTweaks],
  [flutterSlider, flutterValue, applyTweaks],

  [dryWetSlider, dryWetValue, applyMix],
  [glueSlider, glueValue, applyMix],
  [widthMixSlider, widthMixValue, applyMix],
  [punchSlider, punchValue, applyMix],
  [airSlider, airValue, applyMix],
  [lowWeightSlider, lowWeightValue, applyMix],
  [noiseFloorSlider, noiseFloorValue, applyMix],
  [crossmixSlider, crossmixValue, applyMix]
].forEach(([slider, number, callback]) => bindSliderNumber(slider, number, callback));

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

  if (intensity < 0.2) return `rgb(0, 0, ${Math.floor(80 + intensity * 200)})`;
  if (intensity < 0.4) return `rgb(0, ${Math.floor(intensity * 255)}, 160)`;
  if (intensity < 0.65) return `rgb(${Math.floor(intensity * 180)}, ${Math.floor(120 + intensity * 100)}, 80)`;
  if (intensity < 0.85) return `rgb(${Math.floor(180 + intensity * 60)}, ${Math.floor(120 + intensity * 80)}, 40)`;
  return `rgb(255, 255, ${Math.floor(150 + intensity * 80)})`;
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

// ---------------- RANDOMIZE ----------------
randomButton.addEventListener("click", () => {
  if (!audioStarted) return alert("First click Start Audio");

  const target = controlTargetSelect.value;
  controlState[target].volume = Math.floor(Math.random() * 101);
  controlState[target].filter = Math.floor(Math.random() * 101);
  controlState[target].speed = 70 + Math.floor(Math.random() * 61);
  controlState[target].distortion = Math.floor(Math.random() * 40);

  syncControlSlidersToTarget();
  applyStoredVolume(target);
  applyStoredFilter(target);
  applyStoredSpeed(target);
  applyStoredDistortion(target);

  if (driftSlider) driftSlider.value = driftValue.value = Math.floor(Math.random() * 40);
  if (smearSlider) smearSlider.value = smearValue.value = Math.floor(Math.random() * 45);
  if (grainSlider) grainSlider.value = grainValue.value = Math.floor(Math.random() * 50);
  if (crushSlider) crushSlider.value = crushValue.value = Math.floor(Math.random() * 25);
  if (stretchSlider) stretchSlider.value = stretchValue.value = Math.floor(Math.random() * 30);
  if (motionSlider) motionSlider.value = motionValue.value = Math.floor(Math.random() * 40);
  if (blurSlider) blurSlider.value = blurValue.value = Math.floor(Math.random() * 40);
  if (flutterSlider) flutterSlider.value = flutterValue.value = Math.floor(Math.random() * 20);

  if (dryWetSlider) dryWetSlider.value = dryWetValue.value = Math.floor(Math.random() * 60);
  if (glueSlider) glueSlider.value = glueValue.value = Math.floor(Math.random() * 50);
  if (widthMixSlider) widthMixSlider.value = widthMixValue.value = 30 + Math.floor(Math.random() * 50);
  if (punchSlider) punchSlider.value = punchValue.value = Math.floor(Math.random() * 70);
  if (airSlider) airSlider.value = airValue.value = Math.floor(Math.random() * 50);
  if (lowWeightSlider) lowWeightSlider.value = lowWeightValue.value = 20 + Math.floor(Math.random() * 60);
  if (noiseFloorSlider) noiseFloorSlider.value = noiseFloorValue.value = Math.floor(Math.random() * 25);
  if (crossmixSlider) crossmixSlider.value = crossmixValue.value = Math.floor(Math.random() * 40);

  applyTweaks();
  applyMix();
});

// ---------------- INIT ----------------
syncControlSlidersToTarget();
applyMasterFx();
applyTweaks();
applyMix();

oscilloscopeCtx.fillStyle = "black";
oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

spectrogramCtx.fillStyle = "black";
spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);
drawSpectrogramOverlay();

drawOscilloscope();
drawSpectrogram();
