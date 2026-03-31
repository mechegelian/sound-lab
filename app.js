const startButton = document.getElementById("startButton");
const playAllButton = document.getElementById("playAllButton");
const stopAllButton = document.getElementById("stopAllButton");
const randomButton = document.getElementById("randomButton");

const textureAButton = document.getElementById("textureAButton");
const textureBButton = document.getElementById("textureBButton");
const textureCButton = document.getElementById("textureCButton");
const textureDButton = document.getElementById("textureDButton");
const textureEButton = document.getElementById("textureEButton");

const hitUpButton = document.getElementById("hitUpButton");
const hitDownButton = document.getElementById("hitDownButton");
const echoBurstButton = document.getElementById("echoBurstButton");
const muffleButton = document.getElementById("muffleButton");
const warpButton = document.getElementById("warpButton");

const hitUpDuration = document.getElementById("hitUpDuration");
const hitDownDuration = document.getElementById("hitDownDuration");
const echoBurstDuration = document.getElementById("echoBurstDuration");
const muffleDuration = document.getElementById("muffleDuration");
const warpDuration = document.getElementById("warpDuration");

const hitUpDurationValue = document.getElementById("hitUpDurationValue");
const hitDownDurationValue = document.getElementById("hitDownDurationValue");
const echoBurstDurationValue = document.getElementById("echoBurstDurationValue");
const muffleDurationValue = document.getElementById("muffleDurationValue");
const warpDurationValue = document.getElementById("warpDurationValue");

const controlTargetSelect = document.getElementById("controlTargetSelect");
const volumeSlider = document.getElementById("volumeSlider");
const filterSlider = document.getElementById("filterSlider");
const speedSlider = document.getElementById("speedSlider");
const distortionSlider = document.getElementById("distortionSlider");

const subPulseFreq = document.getElementById("subPulseFreq");
const subPulseDetune = document.getElementById("subPulseDetune");
const windPipeTone = document.getElementById("windPipeTone");
const windPipeBreath = document.getElementById("windPipeBreath");

const subPulseFreqValue = document.getElementById("subPulseFreqValue");
const subPulseDetuneValue = document.getElementById("subPulseDetuneValue");
const windPipeToneValue = document.getElementById("windPipeToneValue");
const windPipeBreathValue = document.getElementById("windPipeBreathValue");

const loopEffectSelect = document.getElementById("loopEffectSelect");
const loopInterval = document.getElementById("loopInterval");
const loopDuration = document.getElementById("loopDuration");
const loopIntervalValue = document.getElementById("loopIntervalValue");
const loopDurationValue = document.getElementById("loopDurationValue");
const startLoopButton = document.getElementById("startLoopButton");
const stopLoopButton = document.getElementById("stopLoopButton");
const loopStatus = document.getElementById("loopStatus");

const oscilloscopeCanvas = document.getElementById("oscilloscope");
const oscilloscopeCtx = oscilloscopeCanvas.getContext("2d");

const spectrogramCanvas = document.getElementById("spectrogram");
const spectrogramCtx = spectrogramCanvas.getContext("2d");

const spectrogramOverlayCanvas = document.getElementById("spectrogramOverlay");
const spectrogramOverlayCtx = spectrogramOverlayCanvas.getContext("2d");

const pauseSpectrogramButton = document.getElementById("pauseSpectrogramButton");
const resumeSpectrogramButton = document.getElementById("resumeSpectrogramButton");
const clearSpectrogramButton = document.getElementById("clearSpectrogramButton");

let audioStarted = false;
let textureAOn = false;
let textureBOn = false;
let textureCOn = false;
let textureDOn = false;
let textureEOn = false;

let spectrogramPaused = false;
let effectLoopId = null;
const spectrogramSecondsVisible = 8;

const baseFreq1 = 110;
const baseFreq2 = 111.2;
const baseFreq3 = 55;

// -------------------------
// CONTROL STATE
// -------------------------
const controlState = {
  master: { volume: 70, filter: 50, speed: 100, distortion: 0 },
  a: { volume: 70, filter: 50, speed: 100, distortion: 0 },
  b: { volume: 56, filter: 25, speed: 100, distortion: 0 },
  c: { volume: 44, filter: 55, speed: 100, distortion: 0 },
  d: { volume: 50, filter: 30, speed: 100, distortion: 0 },
  e: { volume: 42, filter: 60, speed: 100, distortion: 0 }
};

// -------------------------
// ANALYSIS + MASTER FX
// -------------------------
const waveformAnalyser = new Tone.Analyser("waveform", 1024);
const fftAnalyser = new Tone.Analyser("fft", 256);

const masterGain = new Tone.Gain(0.7);
const masterFilter = new Tone.Filter(1200, "lowpass");
const masterDistortion = new Tone.Distortion(0);
const echoDelay = new Tone.FeedbackDelay(0.25, 0.2);
echoDelay.wet.value = 0;

// -------------------------
// TEXTURE A : Drift Core
// -------------------------
const textureAFilter = new Tone.Filter(1800, "lowpass");
const textureADistortion = new Tone.Distortion(0);
const textureAGain = new Tone.Gain(0);

const textureAOsc1 = new Tone.Oscillator(baseFreq1, "sine");
const textureAOsc2 = new Tone.Oscillator(baseFreq2, "triangle");
const textureAOsc3 = new Tone.Oscillator(baseFreq3, "sine");

// -------------------------
// TEXTURE B : Low Engine
// -------------------------
const textureBFilter = new Tone.Filter(220, "lowpass");
const textureBDistortion = new Tone.Distortion(0);
const textureBGain = new Tone.Gain(0);

const textureBOsc1 = new Tone.Oscillator(43.65, "square");
const textureBOsc2 = new Tone.Oscillator(87.3, "sine");
const textureBOsc3 = new Tone.Oscillator(65.4, "triangle");

// -------------------------
// TEXTURE C : Air Reed
// -------------------------
const textureCFilter = new Tone.Filter(1400, "bandpass");
const textureCDistortion = new Tone.Distortion(0);
const textureCGain = new Tone.Gain(0);

const textureCNoise = new Tone.Noise("pink");
const textureCOsc = new Tone.Oscillator(523.25, "sine");
const textureCFilterLFO = new Tone.LFO(0.22, 900, 2200);

// -------------------------
// TEXTURE D : Sub Pulse
// -------------------------
const textureDFilter = new Tone.Filter(260, "lowpass");
const textureDDistortion = new Tone.Distortion(0);
const textureDGain = new Tone.Gain(0);

const textureDOsc1 = new Tone.Oscillator(48, "sawtooth");
const textureDOsc2 = new Tone.Oscillator(50.5, "square");

// -------------------------
// TEXTURE E : Wind Pipe
// -------------------------
const textureEFilter = new Tone.Filter(1200, "bandpass");
const textureEDistortion = new Tone.Distortion(0);
const textureEGain = new Tone.Gain(0);
const textureENoiseGain = new Tone.Gain(0.3);

const textureENoise = new Tone.Noise("pink");
const textureEOsc = new Tone.Oscillator(620, "triangle");
const textureEFilterLFO = new Tone.LFO(0.18, 700, 1700);

// -------------------------
// CONNECTIONS
// -------------------------

// A
textureAOsc1.connect(textureAFilter);
textureAOsc2.connect(textureAFilter);
textureAOsc3.connect(textureAFilter);
textureAFilter.connect(textureADistortion);
textureADistortion.connect(textureAGain);

// B
textureBOsc1.connect(textureBFilter);
textureBOsc2.connect(textureBFilter);
textureBOsc3.connect(textureBFilter);
textureBFilter.connect(textureBDistortion);
textureBDistortion.connect(textureBGain);

// C
textureCNoise.connect(textureCFilter);
textureCOsc.connect(textureCFilter);
textureCFilterLFO.connect(textureCFilter.frequency);
textureCFilter.connect(textureCDistortion);
textureCDistortion.connect(textureCGain);

// D
textureDOsc1.connect(textureDFilter);
textureDOsc2.connect(textureDFilter);
textureDFilter.connect(textureDDistortion);
textureDDistortion.connect(textureDGain);

// E
textureENoise.connect(textureENoiseGain);
textureENoiseGain.connect(textureEFilter);
textureEOsc.connect(textureEFilter);
textureEFilterLFO.connect(textureEFilter.frequency);
textureEFilter.connect(textureEDistortion);
textureEDistortion.connect(textureEGain);

// all to master
textureAGain.connect(masterFilter);
textureBGain.connect(masterFilter);
textureCGain.connect(masterFilter);
textureDGain.connect(masterFilter);
textureEGain.connect(masterFilter);

masterFilter.connect(masterDistortion);
masterDistortion.connect(echoDelay);
echoDelay.connect(masterGain);

masterGain.connect(waveformAnalyser);
masterGain.connect(fftAnalyser);
masterGain.toDestination();

// -------------------------
// START SOURCES
// -------------------------
textureAOsc1.start();
textureAOsc2.start();
textureAOsc3.start();

textureBOsc1.start();
textureBOsc2.start();
textureBOsc3.start();

textureCNoise.start();
textureCOsc.start();
textureCFilterLFO.start();

textureDOsc1.start();
textureDOsc2.start();

textureENoise.start();
textureEOsc.start();
textureEFilterLFO.start();

// -------------------------
// HELPERS
// -------------------------
function sliderToGain(target, value) {
  if (target === "master") return value / 100;
  return value / 200;
}

function sliderToFrequency(value) {
  const minFreq = 100;
  const maxFreq = 5000;
  return minFreq + (value / 100) * (maxFreq - minFreq);
}

function getGainNode(target) {
  const map = {
    a: textureAGain,
    b: textureBGain,
    c: textureCGain,
    d: textureDGain,
    e: textureEGain
  };
  return map[target];
}

function getFilterNode(target) {
  const map = {
    a: textureAFilter,
    b: textureBFilter,
    c: textureCFilter,
    d: textureDFilter,
    e: textureEFilter
  };
  return map[target];
}

function getDistortionNode(target) {
  const map = {
    a: textureADistortion,
    b: textureBDistortion,
    c: textureCDistortion,
    d: textureDDistortion,
    e: textureEDistortion
  };
  return map[target];
}

function isTextureOn(target) {
  return (
    (target === "a" && textureAOn) ||
    (target === "b" && textureBOn) ||
    (target === "c" && textureCOn) ||
    (target === "d" && textureDOn) ||
    (target === "e" && textureEOn)
  );
}

function getControlTarget() {
  return controlTargetSelect.value;
}

function requireAnyTexture() {
  if (!audioStarted) {
    alert("First click Start Audio");
    return false;
  }

  if (!textureAOn && !textureBOn && !textureCOn && !textureDOn && !textureEOn) {
    alert("Turn on at least one sound first");
    return false;
  }

  return true;
}

// -------------------------
// APPLY STORED CONTROLS
// -------------------------
function applyStoredVolume(target) {
  if (target === "master") {
    masterGain.gain.rampTo(sliderToGain("master", controlState.master.volume), 0.1);
    return;
  }

  const gainNode = getGainNode(target);
  if (gainNode && isTextureOn(target)) {
    gainNode.gain.rampTo(sliderToGain(target, controlState[target].volume), 0.1);
  }
}

function applyStoredFilter(target) {
  if (target === "master") {
    masterFilter.frequency.rampTo(sliderToFrequency(controlState.master.filter), 0.1);
    return;
  }

  const filterNode = getFilterNode(target);
  if (filterNode) {
    filterNode.frequency.rampTo(sliderToFrequency(controlState[target].filter), 0.1);
  }
}

function applyStoredDistortion(target) {
  if (target === "master") {
    masterDistortion.distortion = controlState.master.distortion / 100;
    return;
  }

  const distortionNode = getDistortionNode(target);
  if (distortionNode) {
    distortionNode.distortion = controlState[target].distortion / 100;
  }
}

function applyStoredSpeed(target) {
  const speedMultiplier = controlState[target].speed / 100;

  if (target === "a") {
    textureAOsc1.frequency.rampTo(baseFreq1 * speedMultiplier, 0.1);
    textureAOsc2.frequency.rampTo(baseFreq2 * speedMultiplier, 0.1);
    textureAOsc3.frequency.rampTo(baseFreq3 * speedMultiplier, 0.1);
  }

  if (target === "b") {
    textureBOsc1.frequency.rampTo(43.65 * speedMultiplier, 0.1);
    textureBOsc2.frequency.rampTo(87.3 * speedMultiplier, 0.1);
    textureBOsc3.frequency.rampTo(65.4 * speedMultiplier, 0.1);
  }

  if (target === "c") {
    textureCOsc.frequency.rampTo(523.25 * speedMultiplier, 0.1);
    textureCFilterLFO.frequency.rampTo(0.22 * speedMultiplier, 0.1);
  }

  if (target === "d") {
    const base = Number(subPulseFreq.value);
    const detune = Number(subPulseDetune.value);
    textureDOsc1.frequency.rampTo(base * speedMultiplier, 0.1);
    textureDOsc2.frequency.rampTo((base + detune) * speedMultiplier, 0.1);
  }

  if (target === "e") {
    const tone = Number(windPipeTone.value);
    textureEOsc.frequency.rampTo(tone * speedMultiplier, 0.1);
    textureEFilterLFO.frequency.rampTo(0.18 * speedMultiplier, 0.1);
  }

  if (target === "master") {
    applyStoredSpeed("a");
    applyStoredSpeed("b");
    applyStoredSpeed("c");
    applyStoredSpeed("d");
    applyStoredSpeed("e");
  }
}

function applyAllStoredControls() {
  ["master", "a", "b", "c", "d", "e"].forEach(function (target) {
    applyStoredVolume(target);
    applyStoredFilter(target);
    applyStoredDistortion(target);
    applyStoredSpeed(target);
  });
}

// -------------------------
// UI <-> STATE SYNC
// -------------------------
function syncControlSlidersToTarget() {
  const target = getControlTarget();
  volumeSlider.value = controlState[target].volume;
  filterSlider.value = controlState[target].filter;
  speedSlider.value = controlState[target].speed;
  distortionSlider.value = controlState[target].distortion;
}

controlTargetSelect.addEventListener("change", syncControlSlidersToTarget);

// -------------------------
// AUDIO START
// -------------------------
startButton.addEventListener("click", async function () {
  if (audioStarted) return;

  await Tone.start();
  audioStarted = true;
  startButton.textContent = "Audio Ready";
});

// -------------------------
// TOGGLE HELPERS
// -------------------------
function setTextureAState(isOn) {
  textureAOn = isOn;
  if (textureAOn) {
    textureAGain.gain.rampTo(sliderToGain("a", controlState.a.volume), 0.2);
    textureAButton.textContent = "ON";
    textureAButton.classList.add("active");
  } else {
    textureAGain.gain.rampTo(0, 0.2);
    textureAButton.textContent = "OFF";
    textureAButton.classList.remove("active");
  }
}

function setTextureBState(isOn) {
  textureBOn = isOn;
  if (textureBOn) {
    textureBGain.gain.rampTo(sliderToGain("b", controlState.b.volume), 0.2);
    textureBButton.textContent = "ON";
    textureBButton.classList.add("active");
  } else {
    textureBGain.gain.rampTo(0, 0.2);
    textureBButton.textContent = "OFF";
    textureBButton.classList.remove("active");
  }
}

function setTextureCState(isOn) {
  textureCOn = isOn;
  if (textureCOn) {
    textureCGain.gain.rampTo(sliderToGain("c", controlState.c.volume), 0.2);
    textureCButton.textContent = "ON";
    textureCButton.classList.add("active");
  } else {
    textureCGain.gain.rampTo(0, 0.2);
    textureCButton.textContent = "OFF";
    textureCButton.classList.remove("active");
  }
}

function setTextureDState(isOn) {
  textureDOn = isOn;
  if (textureDOn) {
    textureDGain.gain.rampTo(sliderToGain("d", controlState.d.volume), 0.2);
    textureDButton.textContent = "ON";
    textureDButton.classList.add("active");
  } else {
    textureDGain.gain.rampTo(0, 0.2);
    textureDButton.textContent = "OFF";
    textureDButton.classList.remove("active");
  }
}

function setTextureEState(isOn) {
  textureEOn = isOn;
  if (textureEOn) {
    textureEGain.gain.rampTo(sliderToGain("e", controlState.e.volume), 0.2);
    textureEButton.textContent = "ON";
    textureEButton.classList.add("active");
  } else {
    textureEGain.gain.rampTo(0, 0.2);
    textureEButton.textContent = "OFF";
    textureEButton.classList.remove("active");
  }
}

// -------------------------
// TEXTURE BUTTONS
// -------------------------
textureAButton.addEventListener("click", function () {
  if (!audioStarted) return alert("First click Start Audio");
  setTextureAState(!textureAOn);
});

textureBButton.addEventListener("click", function () {
  if (!audioStarted) return alert("First click Start Audio");
  setTextureBState(!textureBOn);
});

textureCButton.addEventListener("click", function () {
  if (!audioStarted) return alert("First click Start Audio");
  setTextureCState(!textureCOn);
});

textureDButton.addEventListener("click", function () {
  if (!audioStarted) return alert("First click Start Audio");
  setTextureDState(!textureDOn);
});

textureEButton.addEventListener("click", function () {
  if (!audioStarted) return alert("First click Start Audio");
  setTextureEState(!textureEOn);
});

// -------------------------
// PLAY / STOP
// -------------------------
playAllButton.addEventListener("click", function () {
  if (!audioStarted) return alert("First click Start Audio");

  setTextureAState(true);
  setTextureBState(true);
  setTextureCState(true);
  setTextureDState(true);
  setTextureEState(true);
});

stopAllButton.addEventListener("click", function () {
  setTextureAState(false);
  setTextureBState(false);
  setTextureCState(false);
  setTextureDState(false);
  setTextureEState(false);
});

// -------------------------
// CONTROL SLIDERS
// -------------------------
volumeSlider.addEventListener("input", function () {
  const target = getControlTarget();
  controlState[target].volume = Number(volumeSlider.value);
  applyStoredVolume(target);
});

filterSlider.addEventListener("input", function () {
  const target = getControlTarget();
  controlState[target].filter = Number(filterSlider.value);
  applyStoredFilter(target);
});

speedSlider.addEventListener("input", function () {
  const target = getControlTarget();
  controlState[target].speed = Number(speedSlider.value);
  applyStoredSpeed(target);
});

distortionSlider.addEventListener("input", function () {
  const target = getControlTarget();
  controlState[target].distortion = Number(distortionSlider.value);
  applyStoredDistortion(target);
});

// -------------------------
// NEW SOUND PARAMS
// -------------------------
function updateSoundDesignLabels() {
  subPulseFreqValue.textContent = `${subPulseFreq.value}Hz`;
  subPulseDetuneValue.textContent = `${subPulseDetune.value}Hz`;
  windPipeToneValue.textContent = `${windPipeTone.value}Hz`;
  windPipeBreathValue.textContent = `${windPipeBreath.value}%`;
}

function applySubPulseDesign() {
  const speedMultiplier = controlState.d.speed / 100;
  const base = Number(subPulseFreq.value);
  const detune = Number(subPulseDetune.value);

  textureDOsc1.frequency.rampTo(base * speedMultiplier, 0.1);
  textureDOsc2.frequency.rampTo((base + detune) * speedMultiplier, 0.1);
}

function applyWindPipeDesign() {
  const speedMultiplier = controlState.e.speed / 100;
  const tone = Number(windPipeTone.value);
  const breath = Number(windPipeBreath.value);

  textureEOsc.frequency.rampTo(tone * speedMultiplier, 0.1);
  textureEFilter.frequency.rampTo(tone, 0.1);
  textureENoiseGain.gain.rampTo(breath / 180, 0.1);
}

subPulseFreq.addEventListener("input", function () {
  updateSoundDesignLabels();
  applySubPulseDesign();
});

subPulseDetune.addEventListener("input", function () {
  updateSoundDesignLabels();
  applySubPulseDesign();
});

windPipeTone.addEventListener("input", function () {
  updateSoundDesignLabels();
  applyWindPipeDesign();
});

windPipeBreath.addEventListener("input", function () {
  updateSoundDesignLabels();
  applyWindPipeDesign();
});

// -------------------------
// DURATION LABELS
// -------------------------
function updateDurationLabels() {
  hitUpDurationValue.textContent = `${hitUpDuration.value}s`;
  hitDownDurationValue.textContent = `${hitDownDuration.value}s`;
  echoBurstDurationValue.textContent = `${echoBurstDuration.value}s`;
  muffleDurationValue.textContent = `${muffleDuration.value}s`;
  warpDurationValue.textContent = `${warpDuration.value}s`;
  loopIntervalValue.textContent = `${Number(loopInterval.value).toFixed(1)}s`;
  loopDurationValue.textContent = `${Number(loopDuration.value).toFixed(1)}s`;
}

[
  hitUpDuration,
  hitDownDuration,
  echoBurstDuration,
  muffleDuration,
  warpDuration,
  loopInterval,
  loopDuration
].forEach(function (slider) {
  slider.addEventListener("input", updateDurationLabels);
});

// -------------------------
// ACTIVE TARGETS FOR EFFECTS
// -------------------------
function getActiveTextureGroups() {
  const activeGroups = [];

  if (textureAOn) {
    activeGroups.push({
      oscillators: [textureAOsc1, textureAOsc2, textureAOsc3],
      baseFrequencies: [
        baseFreq1 * (controlState.a.speed / 100),
        baseFreq2 * (controlState.a.speed / 100),
        baseFreq3 * (controlState.a.speed / 100)
      ]
    });
  }

  if (textureBOn) {
    activeGroups.push({
      oscillators: [textureBOsc1, textureBOsc2, textureBOsc3],
      baseFrequencies: [
        43.65 * (controlState.b.speed / 100),
        87.3 * (controlState.b.speed / 100),
        65.4 * (controlState.b.speed / 100)
      ]
    });
  }

  if (textureCOn) {
    activeGroups.push({
      oscillators: [textureCOsc],
      baseFrequencies: [523.25 * (controlState.c.speed / 100)]
    });
  }

  if (textureDOn) {
    const base = Number(subPulseFreq.value);
    const detune = Number(subPulseDetune.value);
    activeGroups.push({
      oscillators: [textureDOsc1, textureDOsc2],
      baseFrequencies: [
        base * (controlState.d.speed / 100),
        (base + detune) * (controlState.d.speed / 100)
      ]
    });
  }

  if (textureEOn) {
    activeGroups.push({
      oscillators: [textureEOsc],
      baseFrequencies: [Number(windPipeTone.value) * (controlState.e.speed / 100)]
    });
  }

  return activeGroups;
}

// -------------------------
// EFFECTS
// -------------------------
function applyPitchHit(multiplier, holdTime) {
  if (!requireAnyTexture()) return;

  const activeGroups = getActiveTextureGroups();

  activeGroups.forEach(function (group) {
    group.oscillators.forEach(function (oscillator, index) {
      oscillator.frequency.value = group.baseFrequencies[index] * multiplier;
    });
  });

  setTimeout(function () {
    activeGroups.forEach(function (group) {
      group.oscillators.forEach(function (oscillator, index) {
        oscillator.frequency.rampTo(group.baseFrequencies[index], 0.4);
      });
    });
  }, holdTime * 1000);
}

function triggerEchoBurst(holdTime) {
  if (!requireAnyTexture()) return;

  echoDelay.delayTime.rampTo(0.3, 0.05);
  echoDelay.feedback.rampTo(0.65, 0.1);
  echoDelay.wet.rampTo(0.85, 0.1);

  setTimeout(function () {
    echoDelay.feedback.rampTo(0.2, 0.7);
    echoDelay.wet.rampTo(0, 0.7);
    echoDelay.delayTime.rampTo(0.25, 0.2);
  }, holdTime * 1000);
}

function triggerMuffle(holdTime) {
  if (!requireAnyTexture()) return;

  const normalFreq = sliderToFrequency(controlState.master.filter);
  masterFilter.frequency.cancelScheduledValues(Tone.now());
  masterFilter.frequency.rampTo(220, 0.08);

  setTimeout(function () {
    masterFilter.frequency.rampTo(normalFreq, 0.45);
  }, holdTime * 1000);
}

function triggerWarp(holdTime) {
  if (!requireAnyTexture()) return;

  const activeGroups = getActiveTextureGroups();

  activeGroups.forEach(function (group) {
    group.oscillators.forEach(function (oscillator, index) {
      oscillator.frequency.rampTo(group.baseFrequencies[index] * 1.55, 0.08);
    });
  });

  setTimeout(function () {
    activeGroups.forEach(function (group) {
      group.oscillators.forEach(function (oscillator, index) {
        oscillator.frequency.rampTo(group.baseFrequencies[index] * 0.78, 0.15);
      });
    });
  }, holdTime * 500);

  setTimeout(function () {
    activeGroups.forEach(function (group) {
      group.oscillators.forEach(function (oscillator, index) {
        oscillator.frequency.rampTo(group.baseFrequencies[index], 0.35);
      });
    });
  }, holdTime * 1000);
}

function triggerEffect(effectName, durationValue) {
  if (effectName === "hitUp") applyPitchHit(1.8, durationValue);
  if (effectName === "hitDown") applyPitchHit(0.45, durationValue);
  if (effectName === "echoBurst") triggerEchoBurst(durationValue);
  if (effectName === "muffle") triggerMuffle(durationValue);
  if (effectName === "warp") triggerWarp(durationValue);
}

hitUpButton.addEventListener("click", function () {
  triggerEffect("hitUp", Number(hitUpDuration.value));
});

hitDownButton.addEventListener("click", function () {
  triggerEffect("hitDown", Number(hitDownDuration.value));
});

echoBurstButton.addEventListener("click", function () {
  triggerEffect("echoBurst", Number(echoBurstDuration.value));
});

muffleButton.addEventListener("click", function () {
  triggerEffect("muffle", Number(muffleDuration.value));
});

warpButton.addEventListener("click", function () {
  triggerEffect("warp", Number(warpDuration.value));
});

// -------------------------
// EFFECT LOOP
// -------------------------
function stopEffectLoop() {
  if (effectLoopId) {
    clearInterval(effectLoopId);
    effectLoopId = null;
  }
  loopStatus.textContent = "Idle";
}

startLoopButton.addEventListener("click", function () {
  if (!audioStarted) {
    alert("First click Start Audio");
    return;
  }

  stopEffectLoop();

  const effectName = loopEffectSelect.value;
  const intervalMs = Number(loopInterval.value) * 1000;
  const durationValue = Number(loopDuration.value);

  loopStatus.textContent = `Looping ${effectName}`;

  triggerEffect(effectName, durationValue);

  effectLoopId = setInterval(function () {
    triggerEffect(effectName, durationValue);
  }, intervalMs);
});

stopLoopButton.addEventListener("click", stopEffectLoop);

// -------------------------
// RANDOMIZE
// -------------------------
randomButton.addEventListener("click", function () {
  if (!audioStarted) {
    alert("First click Start Audio");
    return;
  }

  const target = getControlTarget();
  controlState[target].volume = Math.floor(Math.random() * 101);
  controlState[target].filter = Math.floor(Math.random() * 101);
  controlState[target].speed = 70 + Math.floor(Math.random() * 61);
  controlState[target].distortion = Math.floor(Math.random() * 60);

  syncControlSlidersToTarget();
  applyStoredVolume(target);
  applyStoredFilter(target);
  applyStoredSpeed(target);
  applyStoredDistortion(target);

  hitUpDuration.value = (0.3 + Math.random() * 1.4).toFixed(1);
  hitDownDuration.value = (0.3 + Math.random() * 1.4).toFixed(1);
  echoBurstDuration.value = (0.4 + Math.random() * 1.4).toFixed(1);
  muffleDuration.value = (0.4 + Math.random() * 1.4).toFixed(1);
  warpDuration.value = (0.4 + Math.random() * 1.4).toFixed(1);

  updateDurationLabels();
});

// -------------------------
// SPECTROGRAM
// -------------------------
pauseSpectrogramButton.addEventListener("click", function () {
  spectrogramPaused = true;
});

resumeSpectrogramButton.addEventListener("click", function () {
  spectrogramPaused = false;
});

clearSpectrogramButton.addEventListener("click", function () {
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
  spectrogramOverlayCtx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  spectrogramOverlayCtx.fillStyle = "rgba(255, 255, 255, 0.55)";
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

  spectrogramCtx.fillStyle = "rgba(0, 0, 0, 0.18)";
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

// -------------------------
// OSCILLOSCOPE
// -------------------------
function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);

  const waveform = waveformAnalyser.getValue();
  const width = oscilloscopeCanvas.width;
  const height = oscilloscopeCanvas.height;
  const centerY = height / 2;

  oscilloscopeCtx.fillStyle = "rgba(0, 0, 0, 0.18)";
  oscilloscopeCtx.fillRect(0, 0, width, height);

  const sliceWidth = width / waveform.length;

  oscilloscopeCtx.save();
  oscilloscopeCtx.strokeStyle = "rgba(120, 120, 120, 0.18)";
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

  oscilloscopeCtx.save();
  oscilloscopeCtx.beginPath();
  oscilloscopeCtx.lineWidth = 6;
  oscilloscopeCtx.strokeStyle = "rgba(124, 255, 124, 0.18)";
  oscilloscopeCtx.shadowBlur = 18;
  oscilloscopeCtx.shadowColor = "#7cff7c";

  let x = 0;
  for (let i = 0; i < waveform.length; i++) {
    const y = centerY + waveform[i] * (height * 0.42);
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
  for (let i = 0; i < waveform.length; i++) {
    const y = centerY + waveform[i] * (height * 0.42);
    if (i === 0) oscilloscopeCtx.moveTo(x, y);
    else oscilloscopeCtx.lineTo(x, y);
    x += sliceWidth;
  }
  oscilloscopeCtx.stroke();
  oscilloscopeCtx.restore();
}

// -------------------------
// INIT
// -------------------------
updateSoundDesignLabels();
updateDurationLabels();
syncControlSlidersToTarget();
applySubPulseDesign();
applyWindPipeDesign();
applyAllStoredControls();

oscilloscopeCtx.fillStyle = "black";
oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

spectrogramCtx.fillStyle = "black";
spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);
drawSpectrogramOverlay();

drawOscilloscope();
drawSpectrogram();
