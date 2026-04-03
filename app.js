const startButton = document.getElementById("startButton");
const playAllButton = document.getElementById("playAllButton");
const stopAllButton = document.getElementById("stopAllButton");
const randomButton = document.getElementById("randomButton");

const textureAButton = document.getElementById("textureAButton");
const textureBButton = document.getElementById("textureBButton");
const textureCButton = document.getElementById("textureCButton");
const textureDButton = document.getElementById("textureDButton");

const pauseOscilloscopeButton = document.getElementById("pauseOscilloscopeButton");
const resumeOscilloscopeButton = document.getElementById("resumeOscilloscopeButton");
const oscZoomX = document.getElementById("oscZoomX");
const oscZoomY = document.getElementById("oscZoomY");

const pauseSpectrogramButton = document.getElementById("pauseSpectrogramButton");
const resumeSpectrogramButton = document.getElementById("resumeSpectrogramButton");
const clearSpectrogramButton = document.getElementById("clearSpectrogramButton");

const controlTargetSelect = document.getElementById("controlTargetSelect");
const volumeSlider = document.getElementById("volumeSlider");
const filterSlider = document.getElementById("filterSlider");
const speedSlider = document.getElementById("speedSlider");
const distortionSlider = document.getElementById("distortionSlider");

const oscilloscopeCanvas = document.getElementById("oscilloscope");
const oscilloscopeCtx = oscilloscopeCanvas.getContext("2d");

const spectrogramCanvas = document.getElementById("spectrogram");
const spectrogramCtx = spectrogramCanvas.getContext("2d");

const spectrogramOverlayCanvas = document.getElementById("spectrogramOverlay");
const spectrogramOverlayCtx = spectrogramOverlayCanvas.getContext("2d");

// ---------- EQ ELEMENTS ----------
const eqBands = ["60", "250", "1000", "4000", "8000", "15000"];

function getEqElements(prefix) {
  const out = {};
  eqBands.forEach((band) => {
    out[band] = document.getElementById(`${prefix}Eq${band}`);
  });
  return out;
}

const fluteEqEls = getEqElements("flute");
const drumEqEls = getEqElements("drum");
const electroEqEls = getEqElements("electro");
const bassEqEls = getEqElements("bass");

// ---------- LOOP ELEMENTS ----------
function getLoopElements(prefix) {
  return {
    effect: document.getElementById(`${prefix}LoopEffect`),
    interval: document.getElementById(`${prefix}LoopInterval`),
    duration: document.getElementById(`${prefix}LoopDuration`),
    start: document.getElementById(`${prefix}LoopStart`),
    stop: document.getElementById(`${prefix}LoopStop`),
    intervalValue: document.getElementById(`${prefix}LoopIntervalValue`),
    durationValue: document.getElementById(`${prefix}LoopDurationValue`)
  };
}

const fluteLoop = getLoopElements("flute");
const drumLoop = getLoopElements("drum");
const electroLoop = getLoopElements("electro");
const bassLoop = getLoopElements("bass");

// ---------- GLOBAL STATE ----------
let audioStarted = false;
let sourcesStarted = false;

let oscilloscopePaused = false;
let spectrogramPaused = false;

let fluteOn = false;
let drumOn = false;
let electroOn = false;
let bassOn = false;

let fluteLoopId = null;
let drumLoopId = null;
let electroLoopId = null;
let bassLoopId = null;

const spectrogramSecondsVisible = 8;

// ---------- AUDIO GRAPH ----------
const waveformAnalyser = new Tone.Analyser("waveform", 2048);
const fftAnalyser = new Tone.Analyser("fft", 256);

const masterGain = new Tone.Gain(0.75);
const masterFilter = new Tone.Filter(1800, "lowpass");
const masterDistortion = new Tone.Distortion(0);

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
const drumPulse = new Tone.Loop((time) => {
  if (drumOn) {
    drumSynth.triggerAttackRelease("C1", "8n", time, 0.9);
  }
}, "2n");

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

// ---------- 6-BAND EQ ----------
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

// ---------- CONNECTIONS ----------
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

fluteGain.connect(masterFilter);
drumGain.connect(masterFilter);
electroGain.connect(masterFilter);
bassGain.connect(masterFilter);

masterFilter.connect(masterDistortion);
masterDistortion.connect(masterGain);
masterGain.connect(waveformAnalyser);
masterGain.connect(fftAnalyser);
masterGain.toDestination();

// ---------- CONTROL STATE ----------
const controlState = {
  master: { volume: 75, filter: 50, speed: 100, distortion: 0 },
  flute: { volume: 70, filter: 55, speed: 100, distortion: 0 },
  drum: { volume: 75, filter: 45, speed: 100, distortion: 5 },
  electro: { volume: 68, filter: 60, speed: 100, distortion: 12 },
  bass: { volume: 72, filter: 30, speed: 100, distortion: 5 }
};

// ---------- HELPERS ----------
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
    gainNode.gain.value = sliderToGain(target, value);
  }
}

function applyStoredFilter(target) {
  const value = controlState[target].filter;
  const freq = sliderToFrequency(value);

  if (target === "master") {
    masterFilter.frequency.value = freq;
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

  if (target === "flute") {
    fluteOsc.frequency.value = 660 * mult;
    fluteVibrato.frequency.value = 5 * mult;
  }

  if (target === "drum") {
    drumPulse.interval = `${Math.max(0.25, 2 / mult)}n`;
  }

  if (target === "electro") {
    electroOsc1.frequency.value = 220 * mult;
    electroOsc2.frequency.value = 224 * mult;
    electroLfo.frequency.value = 0.25 * mult;
  }

  if (target === "bass") {
    bassOsc1.frequency.value = 55 * mult;
    bassOsc2.frequency.value = 55.5 * mult;
  }

  if (target === "master") {
    ["flute", "drum", "electro", "bass"].forEach(applyStoredSpeed);
  }
}

function applyAllStoredControls() {
  ["master", "flute", "drum", "electro", "bass"].forEach((target) => {
    applyStoredFilter(target);
    applyStoredDistortion(target);
    applyStoredSpeed(target);
  });
}

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

// ---------- EQ ----------
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

// ---------- SOURCE START ----------
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

  Tone.Transport.start();
  drumPulse.start(0);

  sourcesStarted = true;
}

// ---------- SOUND ON/OFF ----------
function setFluteState(isOn) {
  fluteOn = isOn;
  if (isOn) {
    fluteGain.gain.value = sliderToGain("flute", controlState.flute.volume);
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
    drumGain.gain.value = sliderToGain("drum", controlState.drum.volume);
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
    electroGain.gain.value = sliderToGain("electro", controlState.electro.volume);
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
    bassGain.gain.value = sliderToGain("bass", controlState.bass.volume);
    textureDButton.textContent = "ON";
    textureDButton.classList.add("active");
  } else {
    bassGain.gain.value = 0;
    textureDButton.textContent = "OFF";
    textureDButton.classList.remove("active");
  }
}

// ---------- LOOP FX ----------
function triggerLoopEffectForSound(soundName, effectName, durationValue) {
  if (!requireSound(soundName)) return;

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

    const normalFreq = sliderToFrequency(controlState[soundName].filter);
    filterNode.frequency.value = 220;

    setTimeout(() => {
      filterNode.frequency.value = normalFreq;
    }, durationValue * 1000);
  }

  if (effectName === "echoBurst") {
    const gainNode = getGainNode(soundName);
    if (!gainNode) return;

    const normalGain = sliderToGain(soundName, controlState[soundName].volume);
    gainNode.gain.value = normalGain * 1.6;

    setTimeout(() => {
      gainNode.gain.value = normalGain;
    }, durationValue * 1000);
  }
}

// ---------- LOOP ENGINE ----------
function updateLoopLabels() {
  [fluteLoop, drumLoop, electroLoop, bassLoop].forEach((loop) => {
    loop.intervalValue.textContent = `${Number(loop.interval.value).toFixed(1)}s`;
    loop.durationValue.textContent = `${Number(loop.duration.value).toFixed(1)}s`;
  });
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

// ---------- BUTTONS ----------
startButton.addEventListener("click", async () => {
  if (audioStarted) return;

  await Tone.start();
  startSourcesOnce();
  audioStarted = true;
  startButton.textContent = "Audio Ready";

  applyAllStoredControls();
});

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
});

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

// loop bindings
fluteLoop.start.addEventListener("click", () => startLoop("flute", "flute", fluteLoop));
fluteLoop.stop.addEventListener("click", () => stopLoop("flute"));

drumLoop.start.addEventListener("click", () => startLoop("drum", "drum", drumLoop));
drumLoop.stop.addEventListener("click", () => stopLoop("drum"));

electroLoop.start.addEventListener("click", () => startLoop("electro", "electro", electroLoop));
electroLoop.stop.addEventListener("click", () => stopLoop("electro"));

bassLoop.start.addEventListener("click", () => startLoop("bass", "bass", bassLoop));
bassLoop.stop.addEventListener("click", () => stopLoop("bass"));

// loop labels
[
  fluteLoop.interval,
  fluteLoop.duration,
  drumLoop.interval,
  drumLoop.duration,
  electroLoop.interval,
  electroLoop.duration,
  bassLoop.interval,
  bassLoop.duration
].forEach((slider) => {
  slider.addEventListener("input", updateLoopLabels);
});

// eq bind
bindEq(fluteEqEls, fluteEq);
bindEq(drumEqEls, drumEq);
bindEq(electroEqEls, electroEq);
bindEq(bassEqEls, bassEq);

applySixBandEq(fluteEq, readEqValues(fluteEqEls));
applySixBandEq(drumEq, readEqValues(drumEqEls));
applySixBandEq(electroEq, readEqValues(electroEqEls));
applySixBandEq(bassEq, readEqValues(bassEqEls));

// ---------- SCOPE ----------
pauseOscilloscopeButton.addEventListener("click", () => {
  oscilloscopePaused = true;
});

resumeOscilloscopeButton.addEventListener("click", () => {
  oscilloscopePaused = false;
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

  if (oscilloscopePaused) return;

  const waveform = waveformAnalyser.getValue();
  const width = oscilloscopeCanvas.width;
  const height = oscilloscopeCanvas.height;
  const centerY = height / 2;

  const zoomX = Number(oscZoomX.value);
  const zoomY = Number(oscZoomY.value);

  oscilloscopeCtx.fillStyle = "rgba(0,0,0,0.18)";
  oscilloscopeCtx.fillRect(0, 0, width, height);

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

  const samplesToShow = Math.max(128, Math.floor(waveform.length / zoomX));
  const startIndex = Math.floor((waveform.length - samplesToShow) / 2);
  const visibleWaveform = waveform.slice(startIndex, startIndex + samplesToShow);
  const sliceWidth = width / visibleWaveform.length;

  oscilloscopeCtx.save();
  oscilloscopeCtx.beginPath();
  oscilloscopeCtx.lineWidth = 6;
  oscilloscopeCtx.strokeStyle = "rgba(124,255,124,0.18)";
  oscilloscopeCtx.shadowBlur = 18;
  oscilloscopeCtx.shadowColor = "#7cff7c";

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
  oscilloscopeCtx.lineWidth = 2.2;
  oscilloscopeCtx.strokeStyle = "#9dff9d";

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

// ---------- INIT ----------
syncControlSlidersToTarget();
updateLoopLabels();

oscilloscopeCtx.fillStyle = "black";
oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

spectrogramCtx.fillStyle = "black";
spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);
drawSpectrogramOverlay();

drawOscilloscope();
drawSpectrogram();
