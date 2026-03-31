function byId(id) {
  return document.getElementById(id);
}

const startButton = byId("startButton");
const playAllButton = byId("playAllButton");
const stopAllButton = byId("stopAllButton");
const randomButton = byId("randomButton");

const textureAButton = byId("textureAButton");
const textureBButton = byId("textureBButton");
const textureCButton = byId("textureCButton");
const textureDButton = byId("textureDButton");
const textureEButton = byId("textureEButton");

const hitUpButton = byId("hitUpButton");
const hitDownButton = byId("hitDownButton");
const echoBurstButton = byId("echoBurstButton");
const muffleButton = byId("muffleButton");
const warpButton = byId("warpButton");

const hitUpDuration = byId("hitUpDuration");
const hitDownDuration = byId("hitDownDuration");
const echoBurstDuration = byId("echoBurstDuration");
const muffleDuration = byId("muffleDuration");
const warpDuration = byId("warpDuration");

const hitUpDurationValue = byId("hitUpDurationValue");
const hitDownDurationValue = byId("hitDownDurationValue");
const echoBurstDurationValue = byId("echoBurstDurationValue");
const muffleDurationValue = byId("muffleDurationValue");
const warpDurationValue = byId("warpDurationValue");

const controlTargetSelect = byId("controlTargetSelect");
const volumeSlider = byId("volumeSlider");
const filterSlider = byId("filterSlider");
const speedSlider = byId("speedSlider");
const distortionSlider = byId("distortionSlider");

const subPulseFreq = byId("subPulseFreq");
const subPulseDetune = byId("subPulseDetune");
const windPipeTone = byId("windPipeTone");
const windPipeBreath = byId("windPipeBreath");

const subPulseFreqValue = byId("subPulseFreqValue");
const subPulseDetuneValue = byId("subPulseDetuneValue");
const windPipeToneValue = byId("windPipeToneValue");
const windPipeBreathValue = byId("windPipeBreathValue");

const loopEffectSelect = byId("loopEffectSelect");
const loopInterval = byId("loopInterval");
const loopDuration = byId("loopDuration");
const loopIntervalValue = byId("loopIntervalValue");
const loopDurationValue = byId("loopDurationValue");
const startLoopButton = byId("startLoopButton");
const stopLoopButton = byId("stopLoopButton");
const loopStatus = byId("loopStatus");

const pauseSpectrogramButton = byId("pauseSpectrogramButton");
const resumeSpectrogramButton = byId("resumeSpectrogramButton");
const clearSpectrogramButton = byId("clearSpectrogramButton");

const oscilloscopeCanvas = byId("oscilloscope");
const spectrogramCanvas = byId("spectrogram");
const spectrogramOverlay = byId("spectrogramOverlay");

const oscilloscopeCtx = oscilloscopeCanvas ? oscilloscopeCanvas.getContext("2d") : null;
const spectrogramCtx = spectrogramCanvas ? spectrogramCanvas.getContext("2d") : null;
const spectrogramOverlayCtx = spectrogramOverlay ? spectrogramOverlay.getContext("2d") : null;

let audioStarted = false;
let spectrogramPaused = false;
let loopTimer = null;

let textureAOn = false;
let textureBOn = false;
let textureCOn = false;
let textureDOn = false;
let textureEOn = false;

const controlState = {
  master: { volume: 70, filter: 50, speed: 100, distortion: 0 },
  a: { volume: 70, filter: 50, speed: 100, distortion: 0 },
  b: { volume: 56, filter: 25, speed: 100, distortion: 0 },
  c: { volume: 44, filter: 55, speed: 100, distortion: 0 },
  d: { volume: 50, filter: 30, speed: 100, distortion: 0 },
  e: { volume: 42, filter: 60, speed: 100, distortion: 0 }
};

const baseFreq1 = 110;
const baseFreq2 = 111.2;
const baseFreq3 = 55;

// AUDIO GRAPH
const waveformAnalyser = new Tone.Analyser("waveform", 1024);
const fftAnalyser = new Tone.Analyser("fft", 256);

const masterGain = new Tone.Gain(0.7);
const masterFilter = new Tone.Filter(1200, "lowpass");
const masterDistortion = new Tone.Distortion(0);
const echoDelay = new Tone.FeedbackDelay(0.25, 0.2);
echoDelay.wet.value = 0;

const textureAFilter = new Tone.Filter(1800, "lowpass");
const textureADistortion = new Tone.Distortion(0);
const textureAGain = new Tone.Gain(0);
const textureAOsc1 = new Tone.Oscillator(baseFreq1, "sine");
const textureAOsc2 = new Tone.Oscillator(baseFreq2, "triangle");
const textureAOsc3 = new Tone.Oscillator(baseFreq3, "sine");

const textureBFilter = new Tone.Filter(220, "lowpass");
const textureBDistortion = new Tone.Distortion(0);
const textureBGain = new Tone.Gain(0);
const textureBOsc1 = new Tone.Oscillator(43.65, "square");
const textureBOsc2 = new Tone.Oscillator(87.3, "sine");
const textureBOsc3 = new Tone.Oscillator(65.4, "triangle");

const textureCFilter = new Tone.Filter(1400, "bandpass");
const textureCDistortion = new Tone.Distortion(0);
const textureCGain = new Tone.Gain(0);
const textureCNoise = new Tone.Noise("pink");
const textureCOsc = new Tone.Oscillator(523.25, "sine");
const textureCFilterLFO = new Tone.LFO(0.22, 900, 2200);

const textureDFilter = new Tone.Filter(260, "lowpass");
const textureDDistortion = new Tone.Distortion(0);
const textureDGain = new Tone.Gain(0);
const textureDOsc1 = new Tone.Oscillator(48, "sawtooth");
const textureDOsc2 = new Tone.Oscillator(50.5, "square");

const textureEFilter = new Tone.Filter(1200, "bandpass");
const textureEDistortion = new Tone.Distortion(0);
const textureEGain = new Tone.Gain(0);
const textureENoiseGain = new Tone.Gain(0.3);
const textureENoise = new Tone.Noise("pink");
const textureEOsc = new Tone.Oscillator(620, "triangle");
const textureEFilterLFO = new Tone.LFO(0.18, 700, 1700);

// CONNECTIONS
textureAOsc1.connect(textureAFilter);
textureAOsc2.connect(textureAFilter);
textureAOsc3.connect(textureAFilter);
textureAFilter.connect(textureADistortion);
textureADistortion.connect(textureAGain);

textureBOsc1.connect(textureBFilter);
textureBOsc2.connect(textureBFilter);
textureBOsc3.connect(textureBFilter);
textureBFilter.connect(textureBDistortion);
textureBDistortion.connect(textureBGain);

textureCNoise.connect(textureCFilter);
textureCOsc.connect(textureCFilter);
textureCFilterLFO.connect(textureCFilter.frequency);
textureCFilter.connect(textureCDistortion);
textureCDistortion.connect(textureCGain);

textureDOsc1.connect(textureDFilter);
textureDOsc2.connect(textureDFilter);
textureDFilter.connect(textureDDistortion);
textureDDistortion.connect(textureDGain);

textureENoise.connect(textureENoiseGain);
textureENoiseGain.connect(textureEFilter);
textureEOsc.connect(textureEFilter);
textureEFilterLFO.connect(textureEFilter.frequency);
textureEFilter.connect(textureEDistortion);
textureEDistortion.connect(textureEGain);

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

// START NODES
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

function sliderToGain(target, value) {
  return target === "master" ? value / 100 : value / 200;
}

function sliderToFrequency(value) {
  const min = 100;
  const max = 5000;
  return min + (value / 100) * (max - min);
}

function getControlTargetKey() {
  return controlTargetSelect ? controlTargetSelect.value : "master";
}

function getTextureOn(key) {
  return (
    (key === "a" && textureAOn) ||
    (key === "b" && textureBOn) ||
    (key === "c" && textureCOn) ||
    (key === "d" && textureDOn) ||
    (key === "e" && textureEOn)
  );
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

function getGainNode(key) {
  return { a: textureAGain, b: textureBGain, c: textureCGain, d: textureDGain, e: textureEGain }[key];
}

function getFilterNode(key) {
  return { a: textureAFilter, b: textureBFilter, c: textureCFilter, d: textureDFilter, e: textureEFilter }[key];
}

function getDistortionNode(key) {
  return { a: textureADistortion, b: textureBDistortion, c: textureCDistortion, d: textureDDistortion, e: textureEDistortion }[key];
}

function applyStoredVolume(target) {
  if (target === "master") {
    masterGain.gain.rampTo(sliderToGain("master", controlState.master.volume), 0.1);
    return;
  }
  const node = getGainNode(target);
  if (node && getTextureOn(target)) {
    node.gain.rampTo(sliderToGain(target, controlState[target].volume), 0.1);
  }
}

function applyStoredFilter(target) {
  if (target === "master") {
    masterFilter.frequency.rampTo(sliderToFrequency(controlState.master.filter), 0.1);
    return;
  }
  const node = getFilterNode(target);
  if (node) node.frequency.rampTo(sliderToFrequency(controlState[target].filter), 0.1);
}

function applyStoredDistortion(target) {
  if (target === "master") {
    masterDistortion.distortion = controlState.master.distortion / 100;
    return;
  }
  const node = getDistortionNode(target);
  if (node) node.distortion = controlState[target].distortion / 100;
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
}

function applyAllStoredControls() {
  applyStoredVolume("master");
  applyStoredFilter("master");
  applyStoredDistortion("master");
  ["a", "b", "c", "d", "e"].forEach(function (key) {
    applyStoredFilter(key);
    applyStoredDistortion(key);
    applyStoredSpeed(key);
  });
}

function syncControlSlidersToTarget() {
  if (!controlTargetSelect) return;
  const key = getControlTargetKey();
  volumeSlider.value = controlState[key].volume;
  filterSlider.value = controlState[key].filter;
  speedSlider.value = controlState[key].speed;
  distortionSlider.value = controlState[key].distortion;
}

function updateSoundDesignLabels() {
  if (subPulseFreqValue) subPulseFreqValue.textContent = `${subPulseFreq.value}Hz`;
  if (subPulseDetuneValue) subPulseDetuneValue.textContent = `${subPulseDetune.value}Hz`;
  if (windPipeToneValue) windPipeToneValue.textContent = `${windPipeTone.value}Hz`;
  if (windPipeBreathValue) windPipeBreathValue.textContent = `${windPipeBreath.value}%`;
}

function updateDurationLabels() {
  if (hitUpDurationValue) hitUpDurationValue.textContent = `${Number(hitUpDuration.value).toFixed(1)}s`;
  if (hitDownDurationValue) hitDownDurationValue.textContent = `${Number(hitDownDuration.value).toFixed(1)}s`;
  if (echoBurstDurationValue) echoBurstDurationValue.textContent = `${Number(echoBurstDuration.value).toFixed(1)}s`;
  if (muffleDurationValue) muffleDurationValue.textContent = `${Number(muffleDuration.value).toFixed(1)}s`;
  if (warpDurationValue) warpDurationValue.textContent = `${Number(warpDuration.value).toFixed(1)}s`;
  if (loopIntervalValue) loopIntervalValue.textContent = `${Number(loopInterval.value).toFixed(1)}s`;
  if (loopDurationValue) loopDurationValue.textContent = `${Number(loopDuration.value).toFixed(1)}s`;
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

function setTextureState(button, gainNode, key, isOn) {
  if (key === "a") textureAOn = isOn;
  if (key === "b") textureBOn = isOn;
  if (key === "c") textureCOn = isOn;
  if (key === "d") textureDOn = isOn;
  if (key === "e") textureEOn = isOn;

  if (isOn) {
    gainNode.gain.rampTo(sliderToGain(key, controlState[key].volume), 0.2);
    if (button) {
      button.textContent = "ON";
      button.classList.add("active");
    }
  } else {
    gainNode.gain.rampTo(0, 0.2);
    if (button) {
      button.textContent = "OFF";
      button.classList.remove("active");
    }
  }
}

function getActiveGroups() {
  const groups = [];

  if (textureAOn) {
    groups.push({
      oscillators: [textureAOsc1, textureAOsc2, textureAOsc3],
      baseFrequencies: [
        baseFreq1 * (controlState.a.speed / 100),
        baseFreq2 * (controlState.a.speed / 100),
        baseFreq3 * (controlState.a.speed / 100)
      ]
    });
  }

  if (textureBOn) {
    groups.push({
      oscillators: [textureBOsc1, textureBOsc2, textureBOsc3],
      baseFrequencies: [
        43.65 * (controlState.b.speed / 100),
        87.3 * (controlState.b.speed / 100),
        65.4 * (controlState.b.speed / 100)
      ]
    });
  }

  if (textureCOn) {
    groups.push({
      oscillators: [textureCOsc],
      baseFrequencies: [523.25 * (controlState.c.speed / 100)]
    });
  }

  if (textureDOn) {
    const base = Number(subPulseFreq.value);
    const detune = Number(subPulseDetune.value);
    groups.push({
      oscillators: [textureDOsc1, textureDOsc2],
      baseFrequencies: [
        base * (controlState.d.speed / 100),
        (base + detune) * (controlState.d.speed / 100)
      ]
    });
  }

  if (textureEOn) {
    groups.push({
      oscillators: [textureEOsc],
      baseFrequencies: [Number(windPipeTone.value) * (controlState.e.speed / 100)]
    });
  }

  return groups;
}

function triggerPitchEffect(multiplier, holdTime) {
  if (!requireAnyTexture()) return;

  const groups = getActiveGroups();

  groups.forEach(function (group) {
    group.oscillators.forEach(function (osc, i) {
      osc.frequency.value = group.baseFrequencies[i] * multiplier;
    });
  });

  setTimeout(function () {
    groups.forEach(function (group) {
      group.oscillators.forEach(function (osc, i) {
        osc.frequency.rampTo(group.baseFrequencies[i], 0.4);
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

  const groups = getActiveGroups();

  groups.forEach(function (group) {
    group.oscillators.forEach(function (osc, i) {
      osc.frequency.rampTo(group.baseFrequencies[i] * 1.55, 0.08);
    });
  });

  setTimeout(function () {
    groups.forEach(function (group) {
      group.oscillators.forEach(function (osc, i) {
        osc.frequency.rampTo(group.baseFrequencies[i] * 0.78, 0.15);
      });
    });
  }, holdTime * 500);

  setTimeout(function () {
    groups.forEach(function (group) {
      group.oscillators.forEach(function (osc, i) {
        osc.frequency.rampTo(group.baseFrequencies[i], 0.35);
      });
    });
  }, holdTime * 1000);
}

function triggerEffect(effectName, durationValue) {
  if (effectName === "Hit Up") triggerPitchEffect(1.8, durationValue);
  if (effectName === "Hit Down") triggerPitchEffect(0.45, durationValue);
  if (effectName === "Echo Burst") triggerEchoBurst(durationValue);
  if (effectName === "Muffle") triggerMuffle(durationValue);
  if (effectName === "Warp") triggerWarp(durationValue);
}

// SAFE EVENT BINDING
if (startButton) {
  startButton.addEventListener("click", async function () {
    if (audioStarted) return;
    await Tone.start();
    audioStarted = true;
    startButton.textContent = "Audio Ready";
  });
}

if (playAllButton) {
  playAllButton.addEventListener("click", function () {
    if (!audioStarted) return alert("First click Start Audio");
    setTextureState(textureAButton, textureAGain, "a", true);
    setTextureState(textureBButton, textureBGain, "b", true);
    setTextureState(textureCButton, textureCGain, "c", true);
    setTextureState(textureDButton, textureDGain, "d", true);
    setTextureState(textureEButton, textureEGain, "e", true);
  });
}

if (stopAllButton) {
  stopAllButton.addEventListener("click", function () {
    setTextureState(textureAButton, textureAGain, "a", false);
    setTextureState(textureBButton, textureBGain, "b", false);
    setTextureState(textureCButton, textureCGain, "c", false);
    setTextureState(textureDButton, textureDGain, "d", false);
    setTextureState(textureEButton, textureEGain, "e", false);
  });
}

if (randomButton) {
  randomButton.addEventListener("click", function () {
    if (!audioStarted) return alert("First click Start Audio");
    const key = getControlTargetKey();
    controlState[key].volume = Math.floor(Math.random() * 101);
    controlState[key].filter = Math.floor(Math.random() * 101);
    controlState[key].speed = 70 + Math.floor(Math.random() * 61);
    controlState[key].distortion = Math.floor(Math.random() * 60);
    syncControlSlidersToTarget();
    if (key === "master") {
      applyStoredVolume("master");
      applyStoredFilter("master");
      applyStoredDistortion("master");
    } else {
      applyStoredVolume(key);
      applyStoredFilter(key);
      applyStoredDistortion(key);
      applyStoredSpeed(key);
    }
  });
}

[
  [textureAButton, () => setTextureState(textureAButton, textureAGain, "a", !textureAOn)],
  [textureBButton, () => setTextureState(textureBButton, textureBGain, "b", !textureBOn)],
  [textureCButton, () => setTextureState(textureCButton, textureCGain, "c", !textureCOn)],
  [textureDButton, () => setTextureState(textureDButton, textureDGain, "d", !textureDOn)],
  [textureEButton, () => setTextureState(textureEButton, textureEGain, "e", !textureEOn)]
].forEach(([btn, fn]) => {
  if (btn) {
    btn.addEventListener("click", function () {
      if (!audioStarted) return alert("First click Start Audio");
      fn();
    });
  }
});

if (controlTargetSelect) controlTargetSelect.addEventListener("change", syncControlSlidersToTarget);

if (volumeSlider) {
  volumeSlider.addEventListener("input", function () {
    const key = getControlTargetKey();
    controlState[key].volume = Number(volumeSlider.value);
    applyStoredVolume(key);
  });
}

if (filterSlider) {
  filterSlider.addEventListener("input", function () {
    const key = getControlTargetKey();
    controlState[key].filter = Number(filterSlider.value);
    applyStoredFilter(key);
  });
}

if (speedSlider) {
  speedSlider.addEventListener("input", function () {
    const key = getControlTargetKey();
    controlState[key].speed = Number(speedSlider.value);
    if (key === "master") {
      ["a", "b", "c", "d", "e"].forEach(function (t) {
        controlState[t].speed = Number(speedSlider.value);
        applyStoredSpeed(t);
      });
    } else {
      applyStoredSpeed(key);
    }
  });
}

if (distortionSlider) {
  distortionSlider.addEventListener("input", function () {
    const key = getControlTargetKey();
    controlState[key].distortion = Number(distortionSlider.value);
    applyStoredDistortion(key);
  });
}

[subPulseFreq, subPulseDetune].forEach(function (el) {
  if (el) {
    el.addEventListener("input", function () {
      updateSoundDesignLabels();
      applySubPulseDesign();
    });
  }
});

[windPipeTone, windPipeBreath].forEach(function (el) {
  if (el) {
    el.addEventListener("input", function () {
      updateSoundDesignLabels();
      applyWindPipeDesign();
    });
  }
});

[
  hitUpDuration,
  hitDownDuration,
  echoBurstDuration,
  muffleDuration,
  warpDuration,
  loopInterval,
  loopDuration
].forEach(function (slider) {
  if (slider) slider.addEventListener("input", updateDurationLabels);
});

if (hitUpButton) hitUpButton.addEventListener("click", () => triggerEffect("Hit Up", Number(hitUpDuration.value)));
if (hitDownButton) hitDownButton.addEventListener("click", () => triggerEffect("Hit Down", Number(hitDownDuration.value)));
if (echoBurstButton) echoBurstButton.addEventListener("click", () => triggerEffect("Echo Burst", Number(echoBurstDuration.value)));
if (muffleButton) muffleButton.addEventListener("click", () => triggerEffect("Muffle", Number(muffleDuration.value)));
if (warpButton) warpButton.addEventListener("click", () => triggerEffect("Warp", Number(warpDuration.value)));

function stopLoop() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  if (loopStatus) loopStatus.textContent = "Idle";
}

if (startLoopButton) {
  startLoopButton.addEventListener("click", function () {
    if (!audioStarted) return alert("First click Start Audio");
    stopLoop();

    const effectName = loopEffectSelect.value;
    const intervalMs = Number(loopInterval.value) * 1000;
    const durationValue = Number(loopDuration.value);

    if (loopStatus) loopStatus.textContent = `Looping ${effectName}`;
    triggerEffect(effectName, durationValue);

    loopTimer = setInterval(function () {
      triggerEffect(effectName, durationValue);
    }, intervalMs);
  });
}

if (stopLoopButton) stopLoopButton.addEventListener("click", stopLoop);

if (pauseSpectrogramButton) pauseSpectrogramButton.addEventListener("click", () => spectrogramPaused = true);
if (resumeSpectrogramButton) resumeSpectrogramButton.addEventListener("click", () => spectrogramPaused = false);
if (clearSpectrogramButton) {
  clearSpectrogramButton.addEventListener("click", function () {
    if (!spectrogramCtx) return;
    spectrogramCtx.fillStyle = "black";
    spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);
    drawSpectrogramOverlay();
  });
}

function fftToColor(value) {
  const intensity = Math.max(0, Math.min(1, (value + 140) / 140));
  if (intensity < 0.2) return `rgb(0,0,${Math.floor(80 + intensity * 200)})`;
  if (intensity < 0.4) return `rgb(0,${Math.floor(intensity * 255)},160)`;
  if (intensity < 0.65) return `rgb(${Math.floor(intensity * 180)},${Math.floor(120 + intensity * 100)},80)`;
  if (intensity < 0.85) return `rgb(${Math.floor(180 + intensity * 60)},${Math.floor(120 + intensity * 80)},40)`;
  return `rgb(255,255,${Math.floor(150 + intensity * 80)})`;
}

function drawSpectrogramOverlay() {
  if (!spectrogramOverlayCtx || !spectrogramOverlay) return;

  const width = spectrogramOverlay.width;
  const height = spectrogramOverlay.height;

  spectrogramOverlayCtx.clearRect(0, 0, width, height);
  spectrogramOverlayCtx.save();
  spectrogramOverlayCtx.strokeStyle = "rgba(255,255,255,0.14)";
  spectrogramOverlayCtx.fillStyle = "rgba(255,255,255,0.55)";
  spectrogramOverlayCtx.font = "12px Arial";

  for (let i = 0; i <= 8; i++) {
    const x = (width / 8) * i;
    spectrogramOverlayCtx.beginPath();
    spectrogramOverlayCtx.moveTo(x, 0);
    spectrogramOverlayCtx.lineTo(x, height);
    spectrogramOverlayCtx.stroke();
    const secondsAgo = 8 - i;
    spectrogramOverlayCtx.fillText(secondsAgo === 0 ? "now" : `-${secondsAgo}s`, x + 4, 14);
  }

  spectrogramOverlayCtx.restore();
}

function drawSpectrogram() {
  if (!spectrogramCtx || !spectrogramCanvas) return;
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
  if (!oscilloscopeCtx || !oscilloscopeCanvas) return;
  requestAnimationFrame(drawOscilloscope);

  const waveform = waveformAnalyser.getValue();
  const width = oscilloscopeCanvas.width;
  const height = oscilloscopeCanvas.height;
  const centerY = height / 2;

  oscilloscopeCtx.fillStyle = "rgba(0,0,0,0.18)";
  oscilloscopeCtx.fillRect(0, 0, width, height);

  const sliceWidth = width / waveform.length;

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

  oscilloscopeCtx.save();
  oscilloscopeCtx.beginPath();
  oscilloscopeCtx.lineWidth = 6;
  oscilloscopeCtx.strokeStyle = "rgba(124,255,124,0.18)";
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

// INIT
updateSoundDesignLabels();
updateDurationLabels();
syncControlSlidersToTarget();

if (oscilloscopeCtx) {
  oscilloscopeCtx.fillStyle = "black";
  oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);
}

if (spectrogramCtx) {
  spectrogramCtx.fillStyle = "black";
  spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);
}

drawSpectrogramOverlay();
drawOscilloscope();
drawSpectrogram();
