    const startButton = document.getElementById("startButton");
const playAllButton = document.getElementById("playAllButton");
const stopAllButton = document.getElementById("stopAllButton");
const randomButton = document.getElementById("randomButton");

const textureAButton = document.getElementById("textureAButton");
const textureBButton = document.getElementById("textureBButton");
const textureCButton = document.getElementById("textureCButton");

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

const pauseSpectrogramButton = document.getElementById("pauseSpectrogramButton");
const resumeSpectrogramButton = document.getElementById("resumeSpectrogramButton");
const clearSpectrogramButton = document.getElementById("clearSpectrogramButton");

let audioStarted = false;
let textureAOn = false;
let textureBOn = false;
let textureCOn = false;

let spectrogramPaused = false;
const spectrogramSecondsVisible = 8;

const baseFreq1 = 110;
const baseFreq2 = 111.2;
const baseFreq3 = 55;

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
// TEXTURE A
// -------------------------
const textureAGain = new Tone.Gain(0);
const textureAOsc1 = new Tone.Oscillator(baseFreq1, "sine");
const textureAOsc2 = new Tone.Oscillator(baseFreq2, "triangle");
const textureAOsc3 = new Tone.Oscillator(baseFreq3, "sine");

// -------------------------
// TEXTURE B (bass-heavy)
// -------------------------
const textureBGain = new Tone.Gain(0);
const textureBFilter = new Tone.Filter(180, "lowpass");
const textureBOsc1 = new Tone.Oscillator(43.65, "square");
const textureBOsc2 = new Tone.Oscillator(87.3, "sine");
const textureBOsc3 = new Tone.Oscillator(65.4, "triangle");

// -------------------------
// TEXTURE C (airy / blown)
// -------------------------
const textureCGain = new Tone.Gain(0);
const textureCNoise = new Tone.Noise("pink");
const textureCNoiseFilter = new Tone.Filter(1400, "bandpass");
const textureCOsc = new Tone.Oscillator(523.25, "sine");
const textureCFilterLFO = new Tone.LFO(0.22, 900, 2200);

// -------------------------
// CONNECTIONS
// -------------------------
textureAOsc1.connect(textureAGain);
textureAOsc2.connect(textureAGain);
textureAOsc3.connect(textureAGain);

textureBOsc1.connect(textureBFilter);
textureBOsc2.connect(textureBFilter);
textureBOsc3.connect(textureBFilter);
textureBFilter.connect(textureBGain);

textureCNoise.connect(textureCNoiseFilter);
textureCOsc.connect(textureCGain);
textureCNoiseFilter.connect(textureCGain);
textureCFilterLFO.connect(textureCNoiseFilter.frequency);

textureAGain.connect(masterFilter);
textureBGain.connect(masterFilter);
textureCGain.connect(masterFilter);

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
    textureAGain.gain.rampTo(0.35, 0.4);
    textureAButton.textContent = "ON";
    textureAButton.classList.add("active");
  } else {
    textureAGain.gain.rampTo(0, 0.4);
    textureAButton.textContent = "OFF";
    textureAButton.classList.remove("active");
  }
}

function setTextureBState(isOn) {
  textureBOn = isOn;

  if (textureBOn) {
    textureBGain.gain.rampTo(0.28, 0.4);
    textureBButton.textContent = "ON";
    textureBButton.classList.add("active");
  } else {
    textureBGain.gain.rampTo(0, 0.4);
    textureBButton.textContent = "OFF";
    textureBButton.classList.remove("active");
  }
}

function setTextureCState(isOn) {
  textureCOn = isOn;

  if (textureCOn) {
    textureCGain.gain.rampTo(0.22, 0.4);
    textureCButton.textContent = "ON";
    textureCButton.classList.add("active");
  } else {
    textureCGain.gain.rampTo(0, 0.4);
    textureCButton.textContent = "OFF";
    textureCButton.classList.remove("active");
  }
}

// -------------------------
// TEXTURE BUTTONS
// -------------------------
textureAButton.addEventListener("click", function () {
  if (!audioStarted) {
    alert("First click Start Audio");
    return;
  }
  setTextureAState(!textureAOn);
});

textureBButton.addEventListener("click", function () {
  if (!audioStarted) {
    alert("First click Start Audio");
    return;
  }
  setTextureBState(!textureBOn);
});

textureCButton.addEventListener("click", function () {
  if (!audioStarted) {
    alert("First click Start Audio");
    return;
  }
  setTextureCState(!textureCOn);
});

// -------------------------
// PLAY / STOP
// -------------------------
playAllButton.addEventListener("click", function () {
  if (!audioStarted) {
    alert("First click Start Audio");
    return;
  }

  setTextureAState(true);
  setTextureBState(true);
  setTextureCState(true);
});

stopAllButton.addEventListener("click", function () {
  setTextureAState(false);
  setTextureBState(false);
  setTextureCState(false);
});

// -------------------------
// RANDOMIZE
// -------------------------
randomButton.addEventListener("click", function () {
  if (!audioStarted) {
    alert("First click Start Audio");
    return;
  }

  volumeSlider.value = Math.floor(Math.random() * 101);
  filterSlider.value = Math.floor(Math.random() * 101);
  speedSlider.value = 70 + Math.floor(Math.random() * 61);
  distortionSlider.value = Math.floor(Math.random() * 60);

  hitUpDuration.value = (0.3 + Math.random() * 1.4).toFixed(1);
  hitDownDuration.value = (0.3 + Math.random() * 1.4).toFixed(1);
  echoBurstDuration.value = (0.4 + Math.random() * 1.4).toFixed(1);
  muffleDuration.value = (0.4 + Math.random() * 1.4).toFixed(1);
  warpDuration.value = (0.4 + Math.random() * 1.4).toFixed(1);

  updateVolume();
  updateFilter();
  updateSpeed();
  updateDistortion();
  updateDurationLabels();
});

// -------------------------
// SLIDERS
// -------------------------
function updateVolume() {
  const value = Number(volumeSlider.value);
  masterGain.gain.rampTo(value / 100, 0.1);
}

function getFilterFrequencyFromSlider() {
  const value = Number(filterSlider.value);
  const minFreq = 100;
  const maxFreq = 5000;
  return minFreq + (value / 100) * (maxFreq - minFreq);
}

function updateFilter() {
  masterFilter.frequency.rampTo(getFilterFrequencyFromSlider(), 0.1);
}

function updateSpeed() {
  const speedMultiplier = Number(speedSlider.value) / 100;

  textureAOsc1.frequency.rampTo(baseFreq1 * speedMultiplier, 0.1);
  textureAOsc2.frequency.rampTo(baseFreq2 * speedMultiplier, 0.1);
  textureAOsc3.frequency.rampTo(baseFreq3 * speedMultiplier, 0.1);

  textureBOsc1.frequency.rampTo(43.65 * speedMultiplier, 0.1);
  textureBOsc2.frequency.rampTo(87.3 * speedMultiplier, 0.1);
  textureBOsc3.frequency.rampTo(65.4 * speedMultiplier, 0.1);

  textureCOsc.frequency.rampTo(523.25 * speedMultiplier, 0.1);
  textureCFilterLFO.frequency.rampTo(0.22 * speedMultiplier, 0.1);
}

function updateDistortion() {
  const value = Number(distortionSlider.value);
  masterDistortion.distortion = value / 100;
}

function getCurrentSpeedMultiplier() {
  return Number(speedSlider.value) / 100;
}

volumeSlider.addEventListener("input", updateVolume);
filterSlider.addEventListener("input", updateFilter);
speedSlider.addEventListener("input", updateSpeed);
distortionSlider.addEventListener("input", updateDistortion);

// -------------------------
// DURATION LABELS
// -------------------------
function updateDurationLabels() {
  hitUpDurationValue.textContent = `${hitUpDuration.value}s`;
  hitDownDurationValue.textContent = `${hitDownDuration.value}s`;
  echoBurstDurationValue.textContent = `${echoBurstDuration.value}s`;
  muffleDurationValue.textContent = `${muffleDuration.value}s`;
  warpDurationValue.textContent = `${warpDuration.value}s`;
}

hitUpDuration.addEventListener("input", updateDurationLabels);
hitDownDuration.addEventListener("input", updateDurationLabels);
echoBurstDuration.addEventListener("input", updateDurationLabels);
muffleDuration.addEventListener("input", updateDurationLabels);
warpDuration.addEventListener("input", updateDurationLabels);

// -------------------------
// HELPERS
// -------------------------
function requireAnyTexture() {
  if (!audioStarted) {
    alert("First click Start Audio");
    return false;
  }

  if (!textureAOn && !textureBOn && !textureCOn) {
    alert("Turn on at least one texture first");
    return false;
  }

  return true;
}

function getActiveTextureGroups() {
  const speedMultiplier = getCurrentSpeedMultiplier();
  const activeGroups = [];

  if (textureAOn) {
    activeGroups.push({
      oscillators: [textureAOsc1, textureAOsc2, textureAOsc3],
      baseFrequencies: [
        baseFreq1 * speedMultiplier,
        baseFreq2 * speedMultiplier,
        baseFreq3 * speedMultiplier
      ]
    });
  }

  if (textureBOn) {
    activeGroups.push({
      oscillators: [textureBOsc1, textureBOsc2, textureBOsc3],
      baseFrequencies: [
        43.65 * speedMultiplier,
        87.3 * speedMultiplier,
        65.4 * speedMultiplier
      ]
    });
  }

  if (textureCOn) {
    activeGroups.push({
      oscillators: [textureCOsc],
      baseFrequencies: [
        523.25 * speedMultiplier
      ]
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

hitUpButton.addEventListener("click", function () {
  applyPitchHit(1.8, Number(hitUpDuration.value));
});

hitDownButton.addEventListener("click", function () {
  applyPitchHit(0.45, Number(hitDownDuration.value));
});

echoBurstButton.addEventListener("click", function () {
  if (!requireAnyTexture()) return;

  const holdTime = Number(echoBurstDuration.value);

  echoDelay.delayTime.rampTo(0.3, 0.05);
  echoDelay.feedback.rampTo(0.65, 0.1);
  echoDelay.wet.rampTo(0.85, 0.1);

  setTimeout(function () {
    echoDelay.feedback.rampTo(0.2, 0.7);
    echoDelay.wet.rampTo(0, 0.7);
    echoDelay.delayTime.rampTo(0.25, 0.2);
  }, holdTime * 1000);
});

muffleButton.addEventListener("click", function () {
  if (!requireAnyTexture()) return;

  const holdTime = Number(muffleDuration.value);
  const normalFreq = getFilterFrequencyFromSlider();

  masterFilter.frequency.cancelScheduledValues(Tone.now());
  masterFilter.frequency.rampTo(220, 0.08);

  setTimeout(function () {
    masterFilter.frequency.rampTo(normalFreq, 0.45);
  }, holdTime * 1000);
});

warpButton.addEventListener("click", function () {
  if (!requireAnyTexture()) return;

  const holdTime = Number(warpDuration.value);
  const activeGroups = getActiveTextureGroups();

  activeGroups.forEach(function (group) {
    group.oscillators.forEach(function (oscillator, index) {
      const normal = group.baseFrequencies[index];
      const warpUp = normal * 1.55;
      oscillator.frequency.rampTo(warpUp, 0.08);
    });
  });

  setTimeout(function () {
    activeGroups.forEach(function (group) {
      group.oscillators.forEach(function (oscillator, index) {
        const normal = group.baseFrequencies[index];
        const warpDown = normal * 0.78;
        oscillator.frequency.rampTo(warpDown, 0.15);
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
});

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

  oscilloscopeCtx.save();
  oscilloscopeCtx.strokeStyle = "rgba(120, 120, 120, 0.18)";
  oscilloscopeCtx.lineWidth = 1;

  const verticalLines = 12;
  const horizontalLines = 6;

  for (let i = 0; i <= verticalLines; i++) {
    const x = (width / verticalLines) * i;
    oscilloscopeCtx.beginPath();
    oscilloscopeCtx.moveTo(x, 0);
    oscilloscopeCtx.lineTo(x, height);
    oscilloscopeCtx.stroke();
  }

  for (let i = 0; i <= horizontalLines; i++) {
    const y = (height / horizontalLines) * i;
    oscilloscopeCtx.beginPath();
    oscilloscopeCtx.moveTo(0, y);
    oscilloscopeCtx.lineTo(width, y);
    oscilloscopeCtx.stroke();
  }
  oscilloscopeCtx.restore();

  oscilloscopeCtx.save();
  oscilloscopeCtx.strokeStyle = "rgba(180, 255, 180, 0.22)";
  oscilloscopeCtx.lineWidth = 1.5;
  oscilloscopeCtx.beginPath();
  oscilloscopeCtx.moveTo(0, centerY);
  oscilloscopeCtx.lineTo(width, centerY);
  oscilloscopeCtx.stroke();
  oscilloscopeCtx.restore();

  const sliceWidth = width / waveform.length;

  oscilloscopeCtx.save();
  oscilloscopeCtx.beginPath();
  oscilloscopeCtx.lineWidth = 6;
  oscilloscopeCtx.strokeStyle = "rgba(124, 255, 124, 0.18)";
  oscilloscopeCtx.shadowBlur = 18;
  oscilloscopeCtx.shadowColor = "#7cff7c";

  let x = 0;
  for (let i = 0; i < waveform.length; i++) {
    const sample = waveform[i];
    const y = centerY + sample * (height * 0.42);

    if (i === 0) {
      oscilloscopeCtx.moveTo(x, y);
    } else {
      oscilloscopeCtx.lineTo(x, y);
    }
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
    const sample = waveform[i];
    const y = centerY + sample * (height * 0.42);

    if (i === 0) {
      oscilloscopeCtx.moveTo(x, y);
    } else {
      oscilloscopeCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  oscilloscopeCtx.stroke();
  oscilloscopeCtx.restore();
}

// -------------------------
// SPECTROGRAM
// -------------------------
function fftToColor(value) {
  const intensity = Math.max(0, Math.min(1, (value + 140) / 140));

  if (intensity < 0.2) {
    return `rgb(0, 0, ${Math.floor(80 + intensity * 200)})`;
  }
  if (intensity < 0.4) {
    return `rgb(0, ${Math.floor(intensity * 255)}, 160)`;
  }
  if (intensity < 0.65) {
    return `rgb(${Math.floor(intensity * 180)}, ${Math.floor(120 + intensity * 100)}, 80)`;
  }
  if (intensity < 0.85) {
    return `rgb(${Math.floor(180 + intensity * 60)}, ${Math.floor(120 + intensity * 80)}, 40)`;
  }
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

  const markers = spectrogramSecondsVisible;
  for (let i = 0; i <= markers; i++) {
    const x = (width / markers) * i;

    spectrogramOverlayCtx.beginPath();
    spectrogramOverlayCtx.moveTo(x, 0);
    spectrogramOverlayCtx.lineTo(x, height);
    spectrogramOverlayCtx.stroke();

    const secondsAgo = markers - i;
    const label = secondsAgo === 0 ? "now" : `-${secondsAgo}s`;
    spectrogramOverlayCtx.fillText(label, x + 4, 14);
  }
  spectrogramOverlayCtx.restore();

  spectrogramOverlayCtx.save();
  spectrogramOverlayCtx.strokeStyle = "rgba(124, 255, 124, 0.65)";
  spectrogramOverlayCtx.lineWidth = 2;
  spectrogramOverlayCtx.beginPath();
  spectrogramOverlayCtx.moveTo(width - 1, 0);
  spectrogramOverlayCtx.lineTo(width - 1, height);
  spectrogramOverlayCtx.stroke();
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
    const value = values[i];
    spectrogramCtx.fillStyle = fftToColor(value);

    const y = height - (i + 1) * binHeight;
    spectrogramCtx.fillRect(width - 2, y, 2, Math.ceil(binHeight) + 1);
  }

  drawSpectrogramOverlay();
}

// -------------------------
// SPECTROGRAM BUTTONS
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

// -------------------------
// INITIAL CANVAS BACKGROUNDS
// -------------------------
oscilloscopeCtx.fillStyle = "black";
oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);

spectrogramCtx.fillStyle = "black";
spectrogramCtx.fillRect(0, 0, spectrogramCanvas.width, spectrogramCanvas.height);
drawSpectrogramOverlay();

// -------------------------
// START VISUALS
// -------------------------
drawOscilloscope();
drawSpectrogram();

// -------------------------
// INITIAL UI SYNC
// -------------------------
updateVolume();
updateFilter();
updateSpeed();
updateDistortion();
updateDurationLabels();