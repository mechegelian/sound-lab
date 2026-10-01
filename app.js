"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  if (!window.Tone) {
    $("message").textContent =
      "Audio library could not load. Check your connection and reload.";
    document
      .querySelectorAll("button, input")
      .forEach((el) => (el.disabled = true));
    return;
  }
  // Voice definitions and channel EQ routing retained from the original sound LAB.
  // ---------------- AUDIO ----------------
  const waveformAnalyser = new Tone.Waveform(2048);
  const fftAnalyser = new Tone.FFT(2048);

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
    envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.02 },
  });

  const snareNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
  });

  const hatSynth = new Tone.MetalSynth({
    frequency: 260,
    envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 24,
    resonance: 3500,
    octaves: 1.5,
  });

  const clapNoise = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0 },
  });

  const percSynth = new Tone.MembraneSynth({
    pitchDecay: 0.015,
    octaves: 2,
    oscillator: { type: "triangle" },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.02 },
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
    filterEnvelope: {
      attack: 0.001,
      decay: 0.14,
      sustain: 0.12,
      release: 0.05,
      baseFrequency: 300,
      octaves: 2.8,
    },
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
      b15000: make(15000),
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
  // LFO is routed through an offset so cutoff remains independently editable.
  const electroModulation = new Tone.Add(0);
  electroLfo.connect(electroModulation);
  electroModulation.connect(electroFilter.frequency);
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

  const masterGate = new Tone.Gain(0);
  const limiter = new Tone.Limiter(-1);
  const outputMeter = new Tone.Meter();
  masterGain.chain(masterGate, limiter, Tone.Destination);
  limiter.connect(waveformAnalyser);
  limiter.connect(fftAnalyser);
  limiter.connect(outputMeter);

  const ROOT_MIDI = { C: 48, D: 50, E: 52, F: 53, G: 55, A: 57, B: 59 };

  const SCALE_MAP = {
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    whole: [0, 2, 4, 6, 8, 10],
    pentatonic: [0, 3, 5, 7, 10],
  };

  const PATTERN_MAP = {
    straight: {
      bass: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      electro: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      flute: [0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    },
    broken: {
      bass: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
      electro: [0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0],
      flute: [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    },
    syncopated: {
      bass: [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
      electro: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
      flute: [0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    },
    half: {
      bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      electro: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      flute: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    },
  };

  const drumPattern = {
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hat: Array(16).fill(false),
    clap: Array(16).fill(false),
    perc: Array(16).fill(false),
  };

  const acidPattern = {
    steps: Array(16).fill(false),
    accent: Array(16).fill(false),
  };

  [0, 4, 8, 12].forEach((i) => (drumPattern.kick[i] = true));
  [4, 12].forEach((i) => (drumPattern.snare[i] = true));
  [2, 6, 10, 14].forEach((i) => (drumPattern.hat[i] = true));
  [12].forEach((i) => (drumPattern.clap[i] = true));
  [3, 7, 11, 15].forEach((i) => (drumPattern.perc[i] = true));

  [0, 2, 3, 5, 7, 10, 11, 14].forEach((i) => (acidPattern.steps[i] = true));
  [3, 7, 11, 15].forEach((i) => (acidPattern.accent[i] = true));

  // One source of truth. Views never own audio state.
  const CHANNEL_IDS = ["acid", "drum", "flute", "electro", "bass"];
  const EQ_BANDS = [60, 250, 1000, 4000, 8000, 15000];
  const descriptions = {
    acid: "Resonant square / step & accent",
    drum: "Five voices / rhythmic machinery",
    flute: "Triangle & breath / drifting harmonics",
    electro: "Saw & square / moving filter",
    bass: "Detuned oscillators / low frequency pressure",
  };
  const channels = {
    acid: {
      gain: acidGain,
      filter: acidFilter,
      distortion: acidDistortion,
      eq: acidEq,
      volume: 82,
      cutoff: 58,
      drive: 8,
    },
    drum: {
      gain: drumGain,
      filter: drumFilter,
      distortion: drumDistortion,
      eq: drumEq,
      volume: 86,
      cutoff: 64,
      drive: 4,
    },
    flute: {
      gain: fluteGain,
      filter: fluteFilter,
      distortion: fluteDistortion,
      eq: fluteEq,
      volume: 72,
      cutoff: 55,
      drive: 0,
      oscillators: [fluteOsc],
      frequencies: [660],
    },
    electro: {
      gain: electroGain,
      filter: electroFilter,
      distortion: electroDistortion,
      eq: electroEq,
      volume: 74,
      cutoff: 52,
      drive: 12,
      oscillators: [electroOsc1, electroOsc2],
      frequencies: [220, 224],
    },
    bass: {
      gain: bassGain,
      filter: bassFilter,
      distortion: bassDistortion,
      eq: bassEq,
      volume: 80,
      cutoff: 30,
      drive: 5,
      oscillators: [bassOsc1, bassOsc2],
      frequencies: [55, 55.5],
    },
  };
  const state = {
    ready: false,
    playing: false,
    selected: "acid",
    drawer: null,
    bpm: 108,
    swing: 8,
    scene: "fog",
    pendingScene: "fog",
    modified: false,
    pattern: "straight",
    root: "C",
    scale: "minor",
    modDepth: 45,
    output: 92,
    masterFilter: 44,
    masterDrive: 0,
    reverb: 18,
    delay: 10,
    width: 58,
    drift: 18,
    smear: 24,
    grain: 30,
    motion: 28,
    dryWet: 35,
    glue: 22,
    punch: 40,
    chance: 18,
    glitchRate: 6,
    pitch: 35,
    tone: 28,
    autoGlitch: false,
    acidRes: 76,
    acidEnv: 62,
    acidSlide: 30,
    viz: "wave",
    paused: false,
    hold: false,
    zoomX: 1,
    zoomY: 2,
    glow: 15,
    trail: 18,
    line: 1,
    grid: true,
  };
  Object.entries(channels).forEach(([id, c]) => {
    Object.assign(c, {
      id,
      on: false,
      tab: "main",
      pitch: 100,
      rate: "8n",
      length: 16,
      step: 0,
      current: -1,
      eqValues: EQ_BANDS.map(() => 0),
      loop: {
        effect: "hitUp",
        interval: 4,
        duration: 2,
        event: null,
        start: 0,
      },
    });
    // Level, rhythmic envelope and temporary effects are independent gain stages.
    c.gain.disconnect(masterFilter);
    c.pulse = new Tone.Gain(1);
    c.effectGain = new Tone.Gain(1);
    c.gate = new Tone.Gain(0);
    c.pitchOffset = new Tone.Signal(0);
    c.filterOffset = new Tone.Signal(0);
    c.filterOffset.connect(c.filter.detune);
    if (c.oscillators)
      c.oscillators.forEach((osc) => c.pitchOffset.connect(osc.detune));
    c.gain.chain(c.pulse, c.effectGain, c.gate, masterFilter);
    c.meter = new Tone.Meter({ smoothing: 0.8 });
    c.gate.connect(c.meter);
  });
  const SCENES = {
    fog: {
      filters: [44, 58, 64, 55, 52, 30],
      eq: [
        [2, 2, 1, 2, 1, -1],
        [2, 1, 0, -1, -2, -2],
        [0, 2, 3, 1, 2, 1],
        [0, 0, 2, 4, 5, 2],
        [4, 2, -1, -3, -4, -4],
      ],
    },
    glass: {
      filters: [62, 68, 72, 70, 74, 36],
      eq: [
        [1, 1, 2, 4, 5, 2],
        [0, -1, 1, 2, 1, 0],
        [-2, 0, 3, 5, 6, 4],
        [-1, 1, 3, 5, 6, 3],
        [2, 1, -2, -4, -5, -5],
      ],
    },
    underground: {
      filters: [32, 44, 56, 42, 34, 26],
      eq: [
        [5, 4, 1, -1, -2, -3],
        [5, 3, 1, -2, -3, -4],
        [-3, -1, 1, 0, -1, -2],
        [3, 2, 1, 0, -1, -2],
        [6, 5, 2, -2, -4, -5],
      ],
    },
    pulse: {
      filters: [56, 64, 68, 60, 58, 34],
      eq: [
        [4, 2, 2, 3, 2, 0],
        [6, 4, 1, -2, -3, -4],
        [0, 1, 2, 1, 0, -1],
        [2, 2, 3, 4, 3, 1],
        [7, 4, 0, -3, -4, -5],
      ],
    },
  };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const frequency = (value) => 120 + (value / 100) * 4880;
  const cutoffHz = (c) =>
    c.id === "acid" ? 180 + c.cutoff * 30 : frequency(c.cutoff);
  const hz = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(2)} kHz` : `${Math.round(n)} Hz`;
  const db = (n) => (n > 0 ? `${(20 * Math.log10(n)).toFixed(1)} dB` : "−∞ dB");
  const percent = (n) => `${Math.round(n)}%`;
  const message = (text) => {
    $("message").textContent = text;
  };
  function ramp(param, value, seconds = 0.035, time = Tone.now()) {
    param.cancelAndHoldAtTime(time);
    param.linearRampToValueAtTime(value, time + seconds);
  }
  function baseGain(c) {
    const wetBoost = c.id === "drum" ? 0.18 : c.id === "acid" ? 0.12 : 0;
    const punchDivisor = { drum: 220, bass: 340, acid: 260 }[c.id];
    return (
      (c.volume / 130) *
      (1 + (state.dryWet / 100) * wetBoost) *
      (punchDivisor ? 1 + state.punch / punchDivisor : 1)
    );
  }
  function applyChannel(c) {
    ramp(c.gain.gain, baseGain(c));
    if (c.id === "electro") ramp(electroModulation.addend, cutoffHz(c) - 1600);
    else ramp(c.filter.frequency, cutoffHz(c));
    c.distortion.distortion = c.drive / 100;
    EQ_BANDS.forEach((band, i) => ramp(c.eq[`b${band}`].gain, c.eqValues[i]));
  }
  function applyGlobal() {
    ramp(masterGain.gain, state.output / 100);
    ramp(masterFilter.frequency, frequency(state.masterFilter));
    masterDistortion.distortion = state.masterDrive / 100;
    // Preserve the original macro blend, now composed consistently with FX trims.
    ramp(
      masterReverb.wet,
      clamp(state.dryWet * 0.008 + state.reverb / 500, 0, 1),
    );
    ramp(
      masterDelay.wet,
      clamp(state.dryWet * 0.0045 + state.delay / 500, 0, 1),
    );
    ramp(masterWidth.width, state.width / 100);
    ramp(masterCompressor.threshold, -8 - state.glue * 0.22);
    ramp(masterCompressor.ratio, 1 + state.glue / 18);
    fluteVibrato.min = -10 - state.drift * 0.35;
    fluteVibrato.max = 10 + state.drift * 0.35;
    ramp(fluteVibrato.frequency, 4 + state.motion * 0.07);
    electroLfo.min = 700 - state.motion * 5;
    electroLfo.max = 2600 + state.motion * 7;
    ramp(electroLfo.frequency, 0.25 + state.motion * 0.02);
    ramp(fluteNoiseGain.gain, 0.03 + state.grain / 900);
    ramp(floorNoiseGain.gain, 0.002 + state.grain / 8000);
    ramp(masterDelay.delayTime, 0.15 + state.smear / 500, 0.08);
    Object.values(channels).forEach((c) => ramp(c.gain.gain, baseGain(c)));
  }
  // Reverb impulse regeneration is coalesced instead of running on every slider pixel.
  let reverbTimer;
  function updateDecay() {
    clearTimeout(reverbTimer);
    reverbTimer = setTimeout(() => {
      masterReverb.decay = 1.2 + state.smear / 24;
    }, 180);
  }
  let pools;
  function updateNotePools() {
    pools = {};
    for (const id of CHANNEL_IDS.filter((id) => id !== "drum")) {
      const octave = id === "flute" ? 1 : id === "bass" ? -1 : 0;
      pools[id] = SCALE_MAP[state.scale].map((semi) =>
        Tone.Frequency(
          ROOT_MIDI[state.root] + octave * 12 + semi,
          "midi",
        ).toFrequency(),
      );
    }
  }
  function applyScene(name) {
    const scene = SCENES[name];
    state.scene = state.pendingScene = name;
    state.modified = false;
    state.masterFilter = scene.filters[0];
    CHANNEL_IDS.forEach((id, i) => {
      channels[id].cutoff = scene.filters[i + 1];
      channels[id].eqValues = [...scene.eq[i]];
      applyChannel(channels[id]);
    });
    ramp(masterFilter.frequency, frequency(state.masterFilter));
    updateSceneLabel();
  }
  function updateSceneLabel() {
    $("sceneSummary").textContent =
      state.scene.toUpperCase() + (state.modified ? " *" : "");
  }

  // Audio lifecycle. Start unlocks the context; Play starts a fresh transport.
  let startPromise = null,
    sourcesStarted = false,
    generation = 0,
    auditionTimer = null;
  async function ensureAudio() {
    if (state.ready && Tone.context.state === "running") return true;
    if (startPromise) return startPromise;
    startPromise = (async () => {
      $("startButton").disabled = true;
      $("startButton").textContent = "Starting…";
      try {
        await Tone.start();
        await masterReverb.ready;
        if (!sourcesStarted) {
          [
            fluteNoise,
            fluteOsc,
            fluteVibrato,
            electroOsc1,
            electroOsc2,
            electroLfo,
            bassOsc1,
            bassOsc2,
            floorNoise,
          ].forEach((node) => node.start());
          sourcesStarted = true;
        }
        state.ready = true;
        $("startButton").textContent = "Audio ready";
        $("sampleRate").textContent =
          `${(Tone.context.sampleRate / 1000).toFixed(1)} kHz`;
        $("audioDot").classList.add("on");
        $("audioStatus").textContent = state.playing
          ? "PLAYING"
          : "READY / STOPPED";
        message(
          "Audio ready. Play all channels, or switch on an individual sound.",
        );
        startVisualization();
        return true;
      } catch (error) {
        $("startButton").textContent = "Retry audio";
        message(`Could not start audio: ${error.message}`);
        return false;
      } finally {
        $("startButton").disabled = false;
        startPromise = null;
      }
    })();
    return startPromise;
  }
  function startTransport() {
    if (state.playing) return;
    state.playing = true;
    Tone.Transport.bpm.value = state.bpm;
    Tone.Transport.swing = state.swing / 100;
    Tone.Transport.swingSubdivision = "8n";
    ramp(masterGate.gain, 1, 0.02);
    Tone.Transport.start("+0.03");
    lastSpectralTime = 0;
    startVisualization();
    $("audioStatus").textContent = "PLAYING";
    $("playAllButton").setAttribute("aria-pressed", "true");
  }
  function resetTemporary(c) {
    const now = Tone.now();
    [c.pitchOffset, c.filterOffset].forEach((param) =>
      ramp(param, 0, 0.02, now),
    );
    ramp(c.effectGain.gain, 1, 0.02, now);
    ramp(c.pulse.gain, 1, 0.02, now);
  }
  function setChannel(c, on) {
    c.on = on;
    if (!on) {
      stopLoop(c);
      resetTemporary(c);
    }
    ramp(c.gate.gain, on ? 1 : 0, 0.02);
    syncChannels();
  }
  function stopAll() {
    generation++;
    clearTimeout(auditionTimer);
    state.playing = false;
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Draw.cancel();
    Object.values(channels).forEach((c) => {
      setChannel(c, false);
      c.step = 0;
      c.current = -1;
    });
    acidSynth.triggerRelease();
    ramp(masterGate.gain, 0, 0.025);
    visualUntil = performance.now() + 700;
    startVisualization();
    $("audioStatus").textContent = state.ready
      ? "READY / STOPPED"
      : "AUDIO OFF";
    $("playAllButton").setAttribute("aria-pressed", "false");
    highlightSteps();
    if (channels[state.selected].tab === "loop") renderEditor();
    message("Stopped. All channels and loop effects are off.");
  }
  function pulse(c, time, amount, release) {
    const param = c.pulse.gain;
    param.cancelScheduledValues(time);
    param.setValueAtTime(1, time);
    param.linearRampToValueAtTime(amount, time + 0.01);
    param.linearRampToValueAtTime(1, time + release);
  }
  const drumVoices = {
    kick: (time, step) =>
      kickSynth.triggerAttackRelease(
        step % 8 === 4 ? "A0" : "C1",
        "8n",
        time,
        1,
      ),
    snare: (time) => snareNoise.triggerAttackRelease("16n", time, 0.7),
    hat: (time) => hatSynth.triggerAttackRelease(260, "16n", time, 0.38),
    clap: (time) => clapNoise.triggerAttackRelease("16n", time, 0.55),
    perc: (time) => percSynth.triggerAttackRelease("G2", "16n", time, 0.6),
  };
  function sequence(c, time) {
    if (!state.playing) return;
    const step = c.step % c.length;
    const epoch = generation;
    Tone.Draw.schedule(() => {
      if (epoch === generation && state.playing) {
        c.current = step;
        if (state.selected === c.id) highlightSteps();
      }
    }, time);
    if (c.on && c.id === "drum") {
      Object.entries(drumVoices).forEach(([lane, play], i) => {
        if (drumPattern[lane][step]) play(time + i * 0.001, step);
      });
    }
    if (c.on && c.id === "acid" && acidPattern.steps[step]) {
      const note = pools.acid[(step + c.step) % pools.acid.length];
      const accent = acidPattern.accent[step];
      acidFilter.frequency.setValueAtTime(
        cutoffHz(c) + state.acidEnv * 12,
        time,
      );
      acidFilter.frequency.exponentialRampToValueAtTime(
        cutoffHz(c),
        time + 0.14,
      );
      acidFilter.Q.setValueAtTime(6 + state.acidRes / 4, time);
      acidSynth.portamento = (state.acidSlide / 100) * 0.1;
      acidSynth.triggerAttackRelease(note, "16n", time, accent ? 1 : 0.8);
      pulse(c, time, accent ? 1.55 : 1.2, 0.12);
    }
    c.step = (c.step + 1) % 16;
  }
  function scheduleSequencer(c) {
    if (c.scheduleId !== undefined) Tone.Transport.clear(c.scheduleId);
    c.scheduleId = Tone.Transport.scheduleRepeat(
      (time) => sequence(c, time),
      c.rate,
    );
  }
  let accompanimentStep = 0,
    glitchStep = 0;
  Tone.Transport.scheduleRepeat((time) => {
    if (!state.playing) return;
    const step = accompanimentStep;
    for (const id of ["bass", "electro", "flute"]) {
      const c = channels[id];
      if (!c.on || !PATTERN_MAP[state.pattern][id][step]) continue;
      const offset = id === "electro" ? 2 : id === "flute" ? 1 : 0;
      const note =
        (pools[id][(step + offset) % pools[id].length] * c.pitch) / 100;
      const ratio = id === "electro" ? 1.004 + state.modDepth * 0.0001 : 1.01;
      c.frequencies = c.oscillators.map((osc, i) => {
        const freq = note * (i ? ratio : 1);
        osc.frequency.setValueAtTime(freq, time);
        return freq;
      });
      pulse(
        c,
        time,
        id === "bass" ? 1.35 : id === "electro" ? 1.22 : 1.16,
        id === "bass" ? 0.18 : id === "electro" ? 0.14 : 0.2,
      );
    }
    accompanimentStep = (step + 1) % 16;
  }, "8n");
  Tone.Transport.scheduleRepeat((time) => {
    if (
      state.playing &&
      state.autoGlitch &&
      glitchStep++ % state.glitchRate === 0 &&
      Math.random() < state.chance / 100
    )
      glitch(time);
  }, "16n");
  scheduleSequencer(channels.acid);
  scheduleSequencer(channels.drum);

  // Loop effects use the audio-context clock, so seconds stay seconds when BPM changes.
  function transient(param, value, time, duration, base = 0) {
    param.cancelScheduledValues(time);
    param.setValueAtTime(value, time);
    param.setValueAtTime(value, time + Math.max(0.005, duration - 0.02));
    param.linearRampToValueAtTime(base, time + duration);
  }
  function loopEffect(c, time) {
    if (!c.on || !state.playing) return;
    const { effect, duration } = c.loop;
    if (effect === "hitUp" || effect === "hitDown")
      transient(
        c.pitchOffset,
        1200 * Math.log2(effect === "hitUp" ? 1.8 : 0.45),
        time,
        duration,
      );
    if (effect === "warp") {
      transient(c.pitchOffset, 1200 * Math.log2(1.55), time, duration / 2);
      transient(
        c.pitchOffset,
        1200 * Math.log2(0.78),
        time + duration / 2,
        duration / 2,
      );
    }
    if (effect === "muffle")
      transient(
        c.filterOffset,
        1200 * Math.log2(220 / cutoffHz(c)),
        time,
        duration,
      );
    if (effect === "echoBurst")
      transient(c.effectGain.gain, 1.45, time, duration, 1);
  }
  function stopLoop(c) {
    if (c.loop.event !== null) Tone.context.clearInterval(c.loop.event);
    c.loop.event = null;
    resetTemporary(c);
  }
  function startLoop(c) {
    if (!state.ready || !c.on) {
      message("Switch this channel on before starting its loop.");
      return;
    }
    if (!(c.loop.interval > c.loop.duration && c.loop.duration > 0)) {
      message("Loop interval must be longer than its duration.");
      return;
    }
    stopLoop(c);
    c.loop.start = Tone.now();
    loopEffect(c, c.loop.start);
    c.loop.event = Tone.context.setInterval(
      () => loopEffect(c, Tone.now()),
      c.loop.interval,
    );
  }
  function glitch(time = Tone.now()) {
    if (!state.playing) return;
    const duration = 0.216;
    if (channels.electro.on) {
      transient(
        channels.electro.pitchOffset,
        1200 * Math.log2(1 + state.pitch * 0.004),
        time,
        duration,
      );
      transient(
        channels.electro.filterOffset,
        1200 * Math.log2((600 + state.tone * 26) / cutoffHz(channels.electro)),
        time,
        duration,
      );
    }
    if (channels.acid.on)
      transient(
        channels.acid.filterOffset,
        1200 * Math.log2((220 + state.tone * 28) / cutoffHz(channels.acid)),
        time,
        duration,
      );
    if (channels.acid.on)
      transient(
        acidFilter.Q,
        10 + state.tone * 0.15,
        time,
        duration,
        6 + state.acidRes / 4,
      );
    if (channels.drum.on) {
      hatSynth.triggerAttackRelease(260, "16n", time + 0.007, 0.6);
      percSynth.triggerAttackRelease("G2", "16n", time + 0.015, 0.55);
    }
  }

  // Shared, keyboard-native controls. Event delegation survives contextual rerenders.
  const formatters = {};
  function slider(
    key,
    label,
    value,
    min = 0,
    max = 100,
    format = percent,
    note = "",
    step = 1,
  ) {
    formatters[key] = format;
    return `<div class="parameter"><label for="${key}">${label}<output id="${key}-value" for="${key}">${format(value)}</output></label><input id="${key}" data-param="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" style="--fill:${((value - min) / (max - min)) * 100}%" aria-valuetext="${format(value)}">${note ? `<small>${note}</small>` : ""}</div>`;
  }
  function select(key, label, values, value) {
    return `<div class="field"><label for="${key}">${label}</label><select id="${key}" data-select="${key}">${values
      .map((item) => {
        const [v, text] = Array.isArray(item) ? item : [item, item];
        return `<option value="${v}" ${String(value) === String(v) ? "selected" : ""}>${text}</option>`;
      })
      .join("")}</select></div>`;
  }
  function updateSlider(el) {
    const value = Number(el.value);
    el.style.setProperty(
      "--fill",
      `${((value - Number(el.min)) / (Number(el.max) - Number(el.min))) * 100}%`,
    );
    const format = formatters[el.id];
    if (format) {
      $(`${el.id}-value`).textContent = format(value);
      el.setAttribute("aria-valuetext", format(value));
    }
  }
  $("channelList").innerHTML = CHANNEL_IDS.map(
    (id, i) =>
      `<div class="channel-row" id="row-${id}"><button class="channel-select" data-channel="${id}" aria-pressed="${id === state.selected}" aria-controls="instrument-editor"><small>0${i + 1}</small>${id.toUpperCase()}<span class="meter" aria-hidden="true"><i id="meter-${id}"></i></span></button><button class="channel-power" data-power="${id}" aria-label="${id} on/off" aria-pressed="false">OFF</button></div>`,
  ).join("");
  const meterElements = Object.fromEntries(
    CHANNEL_IDS.map((id) => [id, $(`meter-${id}`)]),
  );
  function syncChannels() {
    CHANNEL_IDS.forEach((id) => {
      const c = channels[id],
        row = $(`row-${id}`);
      row.classList.toggle("selected", state.selected === id);
      row
        .querySelector(".channel-select")
        .setAttribute("aria-pressed", state.selected === id);
      const button = row.querySelector(".channel-power");
      button.setAttribute("aria-pressed", c.on);
      button.textContent = c.on ? "ON" : "OFF";
    });
    $("activeCount").textContent =
      `${CHANNEL_IDS.filter((id) => channels[id].on).length} / 5`;
  }
  let eqObserver = null;
  function renderEditor() {
    if (eqObserver) {
      eqObserver.disconnect();
      eqObserver = null;
    }
    const c = channels[state.selected];
    const tabs = c.oscillators ? ["main", "eq", "loop"] : ["main", "seq", "eq"];
    $("editorTitle").textContent = c.id.toUpperCase();
    $("editorDescription").textContent = descriptions[c.id];
    $("editorTabs").innerHTML = tabs
      .map(
        (tab) =>
          `<button id="editor-${tab}" role="tab" data-editor="${tab}" aria-selected="${tab === c.tab}" tabindex="${tab === c.tab ? 0 : -1}" aria-controls="editorContent">${tab}</button>`,
      )
      .join("");
    $("editorContent").setAttribute("aria-labelledby", `editor-${c.tab}`);
    const content = $("editorContent");
    if (c.tab === "main") {
      const speed = c.oscillators
        ? slider(
            "channel-pitch",
            "Pitch / speed",
            c.pitch,
            50,
            150,
            (n) => `${(n / 100).toFixed(2)}×`,
            "Pitch ratio · follows the scale",
          )
        : select(
            "rate",
            "Step speed",
            [
              ["8n", "1/8 note"],
              ["16n", "1/16 note"],
            ],
            c.rate,
          );
      content.innerHTML = `<div class="parameters main-parameters">${slider("channel-volume", "Volume", c.volume, 0, 100, (n) => db(n / 130), "Channel level")}${slider("channel-cutoff", "Filter", c.cutoff, 0, 100, (n) => hz(c.id === "acid" ? 180 + n * 30 : frequency(n)), c.id === "electro" ? "Cutoff offset + LFO" : "Base cutoff")}${speed}${slider("channel-drive", "Distortion", c.drive, 0, 100, percent, "Drive amount")}</div>${c.id === "acid" ? `<div class="parameters acid-controls">${slider("acidRes", "Resonance", state.acidRes)}${slider("acidEnv", "Envelope", state.acidEnv)}${slider("acidSlide", "Slide", state.acidSlide)}</div>` : ""}<p class="editor-note">${c.id === "drum" ? "Five independent lanes. Open SEQ to edit the rhythm; EQ shapes the combined drum signal." : c.id === "acid" ? "Steps and accents live in SEQ. The filter envelope opens above your base cutoff on each note." : "A sustained voice, animated by the music pattern. Pitch follows Root / Scale; LOOP adds temporary gestures."}</p>`;
    }
    if (c.tab === "seq") {
      const pattern = c.id === "acid" ? acidPattern : drumPattern;
      content.innerHTML = `<div class="seq-toolbar">${select(
        "rate",
        "Step rate",
        [
          ["8n", "1/8 note"],
          ["16n", "1/16 note"],
        ],
        c.rate,
      )}${select(
        "length",
        "Length",
        [
          [16, "16 steps"],
          [8, "8 steps"],
        ],
        c.length,
      )}${c.id === "drum" ? '<button id="drumTestButton">Test drum</button>' : ""}</div><div class="sequencer-scroll" aria-label="Step sequencer">${Object.entries(
        pattern,
      )
        .map(
          ([lane, steps]) =>
            `<div class="seq-row" data-lane="${lane}"><span class="seq-label">${lane}</span>${steps.map((on, i) => `<button class="step ${i >= c.length ? "outside" : ""}" data-step="${i}" data-lane="${lane}" aria-label="${c.id} ${lane} step ${i + 1}" aria-pressed="${on}" ${i >= c.length ? "disabled" : ""}>${String(i + 1).padStart(2, "0")}</button>`).join("")}</div>`,
        )
        .join("")}</div>`;
      highlightSteps();
    }
    if (c.tab === "eq") {
      content.innerHTML = `<canvas id="eqCanvas" class="eq-canvas" aria-label="Combined six-band EQ response. Use the sliders below for keyboard control."></canvas><div class="eq-controls">${EQ_BANDS.map((band, i) => slider(`eq-${i}`, band >= 1000 ? `${band / 1000} kHz` : `${band} Hz`, c.eqValues[i], -12, 12, (n) => `${n > 0 ? "+" : ""}${n} dB`)).join("")}</div>`;
      eqObserver = new ResizeObserver(drawEq);
      eqObserver.observe($("eqCanvas"));
      const canvas = $("eqCanvas");
      const changeEq = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = clamp(
          (event.clientX - rect.left - 32) / (rect.width - 45),
          0,
          1,
        );
        let nearest = 0,
          dist = Infinity;
        EQ_BANDS.forEach((band, i) => {
          const d = Math.abs(Math.log10(band / 20) / 3 - x);
          if (d < dist) {
            dist = d;
            nearest = i;
          }
        });
        const value = Math.round(
          clamp(
            12 - ((event.clientY - rect.top - 12) / (rect.height - 36)) * 24,
            -12,
            12,
          ),
        );
        const input = $(`eq-${nearest}`);
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };
      canvas.addEventListener("pointerdown", (event) => {
        canvas.setPointerCapture(event.pointerId);
        changeEq(event);
      });
      canvas.addEventListener("pointermove", (event) => {
        if (canvas.hasPointerCapture(event.pointerId)) changeEq(event);
      });
      canvas.addEventListener("pointerup", (event) => {
        if (canvas.hasPointerCapture(event.pointerId))
          canvas.releasePointerCapture(event.pointerId);
      });
      drawEq();
    }
    if (c.tab === "loop") {
      const loop = c.loop;
      content.innerHTML = `<div class="loop-controls">${select(
        "effect",
        "Loop effect",
        [
          ["hitUp", "Hit up"],
          ["hitDown", "Hit down"],
          ["warp", "Warp"],
          ["muffle", "Muffle"],
          ["echoBurst", "Echo burst / gain"],
        ],
        loop.effect,
      )}<div class="field"><label for="loopInterval">Every / seconds</label><input id="loopInterval" data-loop="interval" type="number" min="0.3" max="120" step="0.1" value="${loop.interval}"></div><div class="field"><label for="loopDuration">Duration / seconds</label><input id="loopDuration" data-loop="duration" type="number" min="0.1" max="119.9" step="0.1" value="${loop.duration}"></div><button id="loopToggle" aria-pressed="${loop.event !== null}">${loop.event !== null ? "Stop loop" : "Start loop"}</button></div><div class="loop-timeline" aria-hidden="true"><span class="duration" style="width:${(loop.duration / loop.interval) * 100}%"></span><span id="loopCursor" class="cursor"></span></div><div class="loop-caption"><span id="loopState">${loop.event !== null ? "LOOP RUNNING" : "LOOP STOPPED"}</span><span id="loopTiming">${loop.duration.toFixed(1)} s active / ${loop.interval.toFixed(1)} s cycle</span></div><p id="loopWarning" class="loop-warning" role="status"></p><p class="editor-note">Hit up, hit down and warp shift pitch. Muffle lowers the filter. Echo burst preserves the original gain burst into the master effects.</p>`;
    }
  }
  function highlightSteps() {
    const c = channels[state.selected];
    if (c.tab !== "seq") return;
    $("editorContent")
      .querySelectorAll("[data-step]")
      .forEach((el) =>
        el.classList.toggle(
          "current",
          Number(el.dataset.step) === c.current && state.playing,
        ),
      );
  }
  function sizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect(),
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr)),
      h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: rect.width, h: rect.height };
  }
  function drawEq() {
    const canvas = $("eqCanvas");
    if (!canvas) return;
    const { ctx, w, h } = sizeCanvas(canvas),
      c = channels[state.selected];
    const x = (f) => 32 + (Math.log10(f / 20) / 3) * (w - 45),
      y = (db) => 12 + ((12 - db) / 24) * (h - 36);
    ctx.clearRect(0, 0, w, h);
    ctx.font = "9px monospace";
    for (const level of [-12, 0, 12]) {
      ctx.strokeStyle = level === 0 ? "#526044" : "#30372b";
      ctx.beginPath();
      ctx.moveTo(32, y(level));
      ctx.lineTo(w - 13, y(level));
      ctx.stroke();
      ctx.fillStyle = "#9ba595";
      ctx.fillText(`${level > 0 ? "+" : ""}${level}`, 1, y(level) + 3);
    }
    EQ_BANDS.forEach((f) => {
      ctx.strokeStyle = "#283023";
      ctx.beginPath();
      ctx.moveTo(x(f), 10);
      ctx.lineTo(x(f), h - 23);
      ctx.stroke();
    });
    // Exact biquad peaking response using the same Q, gain and sample rate as the nodes.
    const sampleRate = Tone.context.sampleRate;
    const coefficients = EQ_BANDS.map((f, i) => {
      const A = 10 ** (c.eqValues[i] / 40),
        omega = (2 * Math.PI * f) / sampleRate,
        alpha = Math.sin(omega) / 2,
        cos = Math.cos(omega);
      return [
        1 + alpha * A,
        -2 * cos,
        1 - alpha * A,
        1 + alpha / A,
        -2 * cos,
        1 - alpha / A,
      ];
    });
    ctx.strokeStyle = "#b8ce88";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      const freq = 20 * 1000 ** (i / 255),
        omega = (2 * Math.PI * freq) / sampleRate;
      let gain = 0;
      for (const [b0, b1, b2, a0, a1, a2] of coefficients) {
        const numerator =
          (b0 + b1 * Math.cos(omega) + b2 * Math.cos(2 * omega)) ** 2 +
          (b1 * Math.sin(omega) + b2 * Math.sin(2 * omega)) ** 2;
        const denominator =
          (a0 + a1 * Math.cos(omega) + a2 * Math.cos(2 * omega)) ** 2 +
          (a1 * Math.sin(omega) + a2 * Math.sin(2 * omega)) ** 2;
        gain += 10 * Math.log10(numerator / denominator);
      }
      const px = x(freq),
        py = y(clamp(gain, -12, 12));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = "#e5e9df";
    c.eqValues.forEach((gain, i) => {
      ctx.fillRect(x(EQ_BANDS[i]) - 2, y(gain) - 2, 4, 4);
    });
    ctx.fillStyle = "#9ba595";
    ctx.fillText("20 Hz", 32, h - 5);
    ctx.fillText("20 kHz", w - 50, h - 5);
  }
  function renderGlobal() {
    const panel = $("global-panel"),
      name = state.drawer;
    panel.hidden = !name;
    document.querySelectorAll("[data-global]").forEach((el) => {
      const open = el.dataset.global === name;
      el.setAttribute("aria-expanded", open);
      el.querySelector("span").textContent = open ? "−" : "+";
    });
    $("sceneShortcut").setAttribute("aria-expanded", name === "music");
    if (!name) return;
    if (name === "music")
      panel.innerHTML = `<div class="global-controls">${select("scene", "Scene", Object.keys(SCENES), state.pendingScene)}${select(
        "pattern",
        "Pattern",
        [
          ["straight", "Straight"],
          ["broken", "Broken"],
          ["syncopated", "Syncopated"],
          ["half", "Half-time"],
        ],
        state.pattern,
      )}${select("root", "Root", Object.keys(ROOT_MIDI), state.root)}${select(
        "scale",
        "Scale",
        [
          ["minor", "Minor"],
          ["dorian", "Dorian"],
          ["whole", "Whole tone"],
          ["pentatonic", "Pentatonic"],
        ],
        state.scale,
      )}${slider("swing", "Swing", state.swing, 0, 80)}<div class="field"><button id="applyScene">Apply scene</button></div></div><div class="global-controls four" style="margin-top:18px">${slider("modDepth", "Mod depth", state.modDepth, 0, 100, percent, "Electro oscillator spread")}</div><p class="panel-note">Scenes replace the five channel EQs and filter settings. Pattern, Root and Scale update live. * marks edited scene settings.</p>`;
    if (name === "fx")
      panel.innerHTML = `<div class="global-controls">${slider("reverb", "Reverb trim", state.reverb)}${slider("delay", "Delay trim", state.delay)}${slider("width", "Width", state.width)}${slider("masterFilter", "Master filter", state.masterFilter, 0, 100, (n) => hz(frequency(n)))}${slider("masterDrive", "Master drive", state.masterDrive)}</div><p class="panel-note">Reverb and delay trims combine with the Mix wet macro. Output is always available in the header.</p>`;
    if (name === "texture")
      panel.innerHTML = `<div class="global-controls four">${slider("drift", "Drift", state.drift, 0, 100, percent, "Flute vibrato depth")}${slider("smear", "Smear", state.smear, 0, 100, percent, "Reverb decay + delay time")}${slider("grain", "Grain", state.grain, 0, 100, percent, "Breath + background noise")}${slider("motion", "Motion", state.motion, 0, 100, percent, "Vibrato + filter movement")}</div>`;
    if (name === "mix")
      panel.innerHTML = `<div class="global-controls four">${slider("dryWet", "Dry / wet", state.dryWet, 0, 100, percent, "FX blend + Acid / Drum lift")}${slider("glue", "Glue", state.glue, 0, 100, percent, "Compression threshold + ratio")}${slider("width", "Width", state.width, 0, 100, percent, "Linked to FX width")}${slider("punch", "Punch", state.punch, 0, 100, percent, "Drum / Bass / Acid gain lift")}</div>`;
    if (name === "glitch")
      panel.innerHTML = `<div class="global-controls four">${slider("chance", "Chance", state.chance, 0, 100, percent, "Probability at each opportunity")}${slider("glitchRate", "Rate", state.glitchRate, 1, 16, (n) => `${n} × 1/16`, "One opportunity every N steps")}${slider("pitch", "Pitch jumps", state.pitch)}${slider("tone", "Tone smash", state.tone)}</div><p class="panel-note">Trigger performs one burst. Auto checks Chance at the selected Rate while transport is playing.</p>`;
  }
  function changeParameter(el) {
    const key = el.dataset.param,
      value = Number(el.value),
      c = channels[state.selected];
    if (!Number.isFinite(value)) return;
    updateSlider(el);
    if (key.startsWith("channel-")) {
      const parameter = key.slice(8),
        previous = c[parameter];
      c[parameter] = value;
      if (parameter === "pitch" && c.oscillators)
        c.oscillators.forEach((osc, i) => {
          c.frequencies[i] *= value / previous;
          ramp(osc.frequency, c.frequencies[i]);
        });
      else applyChannel(c);
      if (parameter === "cutoff") {
        state.modified = true;
        updateSceneLabel();
      }
    } else if (key.startsWith("eq-")) {
      const band = Number(key.slice(3));
      c.eqValues[band] = value;
      ramp(c.eq[`b${EQ_BANDS[band]}`].gain, value);
      drawEq();
      state.modified = true;
      updateSceneLabel();
    } else if (key.startsWith("visual-")) {
      state[key.slice(7)] = value;
      clearScope();
      drawVisualization(performance.now());
    } else {
      state[key] = value;
      if (key === "swing") Tone.Transport.swing = value / 100;
      else if (key === "smear") updateDecay();
      applyGlobal();
      if (key === "masterFilter") {
        state.modified = true;
        updateSceneLabel();
      }
    }
  }
  document.addEventListener("input", (event) => {
    const el = event.target;
    if (el.matches("[data-param]")) changeParameter(el);
  });
  document.addEventListener("change", (event) => {
    const el = event.target,
      c = channels[state.selected],
      key = el.dataset.select;
    if (key === "rate") {
      c.rate = el.value;
      scheduleSequencer(c);
    }
    if (key === "length") {
      c.length = Number(el.value);
      renderEditor();
      $("length").focus();
    }
    if (key === "effect") {
      c.loop.effect = el.value;
      if (c.loop.event !== null) startLoop(c);
    }
    if (key === "scene") state.pendingScene = el.value;
    if (["pattern", "root", "scale"].includes(key)) {
      state[key] = el.value;
      updateNotePools();
    }
    if (el.dataset.loop) {
      const loop = c.loop,
        property = el.dataset.loop,
        value = Number(el.value);
      const interval = property === "interval" ? value : loop.interval,
        duration = property === "duration" ? value : loop.duration;
      if (
        !Number.isFinite(value) ||
        value < Number(el.min) ||
        value > Number(el.max) ||
        duration >= interval
      ) {
        $("loopWarning").textContent =
          "Use a positive duration shorter than the interval. Previous timing is retained.";
        el.value = loop[property];
        return;
      }
      loop[property] = value;
      $("loopWarning").textContent = "";
      if (loop.event !== null) startLoop(c);
      $("loopTiming").textContent =
        `${duration.toFixed(1)} s active / ${interval.toFixed(1)} s cycle`;
      document.querySelector(".loop-timeline .duration").style.width =
        `${(duration / interval) * 100}%`;
    }
  });
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const c = channels[state.selected];
    if (button.dataset.channel) {
      state.selected = button.dataset.channel;
      syncChannels();
      renderEditor();
    }
    if (button.dataset.power) {
      const epoch = generation;
      if (!(await ensureAudio()) || epoch !== generation) return;
      const channel = channels[button.dataset.power];
      startTransport();
      setChannel(channel, !channel.on);
      if (channel.id === state.selected && channel.tab === "loop")
        renderEditor();
    }
    if (button.dataset.editor) {
      c.tab = button.dataset.editor;
      renderEditor();
      $(`editor-${c.tab}`).focus();
    }
    if (button.dataset.step) {
      const pattern = c.id === "acid" ? acidPattern : drumPattern,
        index = Number(button.dataset.step),
        lane = button.dataset.lane;
      pattern[lane][index] = !pattern[lane][index];
      button.setAttribute("aria-pressed", pattern[lane][index]);
    }
    if (button.dataset.global) {
      state.drawer =
        state.drawer === button.dataset.global ? null : button.dataset.global;
      renderGlobal();
    }
    if (button.id === "sceneShortcut") {
      state.drawer = state.drawer === "music" ? null : "music";
      renderGlobal();
    }
    if (button.id === "applyScene") {
      applyScene(state.pendingScene);
      renderEditor();
      message(
        `${state.scene.toUpperCase()} applied: filters and all five EQs updated.`,
      );
    }
    if (button.id === "loopToggle") {
      if (c.loop.event !== null) stopLoop(c);
      else startLoop(c);
      renderEditor();
      $("loopToggle").focus();
    }
    if (button.id === "startButton") await ensureAudio();
    if (button.id === "playAllButton") {
      const epoch = generation;
      if (!(await ensureAudio()) || epoch !== generation) return;
      startTransport();
      Object.values(channels).forEach((channel) => setChannel(channel, true));
      message("Playing all five channels.");
    }
    if (button.id === "stopAllButton") {
      stopAll();
      accompanimentStep = glitchStep = 0;
    }
    if (button.id === "autoGlitch") {
      state.autoGlitch = !state.autoGlitch;
      button.setAttribute("aria-pressed", state.autoGlitch);
      button.querySelector("span").textContent = state.autoGlitch
        ? "ON"
        : "OFF";
    }
    if (button.id === "triggerGlitchButton") {
      if (!state.playing) message("Play a channel to trigger a glitch.");
      else {
        glitch();
        message("Glitch triggered.");
      }
    }
    if (button.id === "randomButton") {
      Object.entries(drumPattern).forEach(([lane, steps]) =>
        steps.forEach((_, i) => {
          steps[i] =
            Math.random() <
            { kick: 0.3, snare: 0.18, hat: 0.5, clap: 0.12, perc: 0.22 }[lane];
        }),
      );
      drumPattern.kick[0] = true;
      acidPattern.steps.forEach((_, i) => {
        acidPattern.steps[i] = Math.random() < 0.55;
        acidPattern.accent[i] = acidPattern.steps[i] && Math.random() < 0.3;
      });
      acidPattern.steps[0] = true;
      if (c.tab === "seq") renderEditor();
      message(
        "New Acid and Drum patterns. Your mix, EQ and loop settings are retained.",
      );
    }
    if (button.id === "drumTestButton") {
      const epoch = generation;
      if (!(await ensureAudio()) || epoch !== generation) return;
      const drum = channels.drum,
        wasPlaying = state.playing;
      ramp(masterGate.gain, 1, 0.005);
      ramp(drum.gate.gain, 1, 0.005);
      const now = Tone.now() + 0.02;
      visualUntil = performance.now() + 1200;
      startVisualization();
      kickSynth.triggerAttackRelease("C1", "8n", now, 0.98);
      snareNoise.triggerAttackRelease("16n", now + 0.12, 0.75);
      hatSynth.triggerAttackRelease(260, "16n", now + 0.17, 0.35);
      clearTimeout(auditionTimer);
      auditionTimer = setTimeout(() => {
        if (epoch !== generation) return;
        ramp(drum.gate.gain, drum.on ? 1 : 0);
        if (!wasPlaying && !state.playing) ramp(masterGate.gain, 0);
      }, 800);
      message("Drum audition. Channel state is unchanged.");
    }
  });
  document.addEventListener("keydown", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')];
      let i = tabs.indexOf(tab);
      i =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (i + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
      tabs[i].click();
      if (tabs[i].isConnected) tabs[i].focus();
    }
    if (event.key === "Escape") {
      state.drawer = null;
      renderGlobal();
      $("visual-settings").hidden = true;
      $("vizSettings").setAttribute("aria-expanded", "false");
    }
  });
  $("bpm").addEventListener("change", (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value)) state.bpm = clamp(value, 70, 180);
    event.target.value = state.bpm;
    Tone.Transport.bpm.rampTo(state.bpm, 0.05);
  });
  $("output").addEventListener("input", (event) => {
    state.output = Number(event.target.value);
    ramp(masterGain.gain, state.output / 100);
    $("outputValue").textContent = db(state.output / 100);
    updateSlider(event.target);
    event.target.setAttribute("aria-valuetext", db(state.output / 100));
  });

  // One renderer: only the visible analysis mode is sampled and drawn.
  const scope = $("scope"),
    scopeCtx = scope.getContext("2d");
  const history = document.createElement("canvas"),
    historyCtx = history.getContext("2d");
  const spectralSeconds = 8;
  let visualUntil = 0;
  let scopeWidth = 0,
    scopeHeight = 0,
    frameId = null,
    lastFrame = 0,
    lastSpectralTime = 0,
    spectralRemainder = 0,
    heldWave = null;
  const palette = Array.from({ length: 256 }, (_, i) => {
    const t = i / 255;
    return `rgb(${Math.round(14 + 170 * t)},${Math.round(17 + 189 * t)},${Math.round(14 + 122 * t)})`;
  });
  function clearScope() {
    scopeCtx.clearRect(0, 0, scopeWidth, scopeHeight);
  }
  function resizeScope() {
    const oldWidth = history.width,
      oldHeight = history.height;
    const copy = document.createElement("canvas");
    copy.width = oldWidth;
    copy.height = oldHeight;
    if (oldWidth && oldHeight) copy.getContext("2d").drawImage(history, 0, 0);
    const sized = sizeCanvas(scope);
    scopeWidth = sized.w;
    scopeHeight = sized.h;
    history.width = Math.max(1, Math.round(scopeWidth - 56));
    history.height = Math.max(1, Math.round(scopeHeight - 53));
    if (oldWidth && oldHeight)
      historyCtx.drawImage(
        copy,
        0,
        0,
        oldWidth,
        oldHeight,
        0,
        0,
        history.width,
        history.height,
      );
    lastSpectralTime = 0;
    spectralRemainder = 0;
    drawVisualization(performance.now(), true);
  }
  new ResizeObserver(resizeScope).observe(scope);
  function grid(ctx, w, h, mode) {
    if (!state.grid) return;
    ctx.strokeStyle = "#263020";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#818e76";
    ctx.font = "9px monospace";
    const top = 13,
      bottom = h - 40,
      left = 40,
      right = w - 16;
    for (let i = 0; i <= 4; i++) {
      const y = top + ((bottom - top) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      if (mode === "spectrum") ctx.fillText(`${-i * 24}`, 5, y + 3);
    }
    for (let i = 0; i <= 8; i++) {
      const x = left + ((right - left) * i) / 8;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
    if (mode === "wave") {
      ctx.fillText("+1", 8, top + 5);
      ctx.fillText("0", 8, (top + bottom) / 2 + 3);
      ctx.fillText("−1", 8, bottom);
    }
    if (mode === "spectrum") {
      for (const freq of [20, 100, 1000, 10000, 20000]) {
        const x = left + (Math.log10(freq / 20) / 3) * (right - left);
        ctx.fillText(
          freq >= 1000 ? `${freq / 1000}k` : `${freq}`,
          Math.min(x, right - 25),
          h - 27,
        );
      }
      ctx.fillText("dBFS", 5, h - 27);
    }
  }
  function drawVisualization(timestamp, force = false) {
    if (!scopeWidth) return;
    if (state.paused && !force) return;
    const w = scopeWidth,
      h = scopeHeight,
      left = 40,
      right = w - 16,
      top = 13,
      bottom = h - 40;
    if (state.viz !== "wave" || force) {
      scopeCtx.fillStyle = "#0e110e";
      scopeCtx.fillRect(0, 0, w, h);
    } else {
      scopeCtx.fillStyle = `rgba(14,17,14,${1 - state.trail * 0.008})`;
      scopeCtx.fillRect(0, 0, w, h);
    }
    if (state.viz === "wave") {
      grid(scopeCtx, w, h, "wave");
      const wave =
        state.hold && heldWave
          ? heldWave
          : state.ready
            ? waveformAnalyser.getValue()
            : null;
      const middle = (top + bottom) / 2;
      scopeCtx.beginPath();
      scopeCtx.strokeStyle = "#b8ce88";
      scopeCtx.lineWidth = state.line;
      scopeCtx.shadowBlur = state.glow * 0.18;
      scopeCtx.shadowColor = "#b8ce88";
      if (wave) {
        const count = Math.max(32, Math.floor(wave.length / state.zoomX));
        // Align to a real rising zero crossing, without synthesizing the displayed signal.
        let start = 0;
        const search = Math.min(
          wave.length - count,
          Math.floor(wave.length / 2),
        );
        for (let i = 1; i < search; i++) {
          if (wave[i - 1] <= 0 && wave[i] > 0) {
            start = i;
            break;
          }
        }
        for (let i = 0; i < count; i++) {
          const x = left + (i / (count - 1)) * (right - left),
            y = middle - wave[start + i] * (bottom - top) * 0.16 * state.zoomY;
          if (i === 0) scopeCtx.moveTo(x, y);
          else scopeCtx.lineTo(x, y);
        }
      } else {
        scopeCtx.moveTo(left, middle);
        scopeCtx.lineTo(right, middle);
      }
      scopeCtx.stroke();
      scopeCtx.shadowBlur = 0;
    } else if (state.viz === "spectrum") {
      grid(scopeCtx, w, h, "spectrum");
      if (state.ready) {
        const values = fftAnalyser.getValue(),
          nyquist = Tone.context.sampleRate / 2;
        scopeCtx.strokeStyle = "#b8ce88";
        scopeCtx.lineWidth = 1;
        scopeCtx.beginPath();
        for (let i = 0; i <= Math.floor(right - left); i++) {
          const freq = 20 * 1000 ** (i / (right - left)),
            bin = clamp(
              Math.round((freq / nyquist) * values.length),
              0,
              values.length - 1,
            ),
            level = clamp(values[bin], -96, 0),
            y = top - (level / 96) * (bottom - top);
          if (i === 0) scopeCtx.moveTo(left + i, y);
          else scopeCtx.lineTo(left + i, y);
        }
        scopeCtx.stroke();
      }
    } else {
      if (!force && state.ready) {
        if (!lastSpectralTime) lastSpectralTime = timestamp;
        spectralRemainder +=
          (((timestamp - lastSpectralTime) / 1000) * history.width) /
          spectralSeconds;
        const shift = Math.min(history.width, Math.floor(spectralRemainder));
        spectralRemainder -= shift;
        lastSpectralTime = timestamp;
        if (shift > 0) {
          if (shift < history.width)
            historyCtx.drawImage(
              history,
              shift,
              0,
              history.width - shift,
              history.height,
              0,
              0,
              history.width - shift,
              history.height,
            );
          const values = fftAnalyser.getValue(),
            nyquist = Tone.context.sampleRate / 2;
          for (let y = 0; y < history.height; y++) {
            const freq = 20 * 1000 ** (1 - y / history.height),
              bin = clamp(
                Math.round((freq / nyquist) * values.length),
                0,
                values.length - 1,
              ),
              color = clamp(
                Math.round(((values[bin] + 100) / 100) * 255),
                0,
                255,
              );
            historyCtx.fillStyle = palette[color];
            historyCtx.fillRect(history.width - shift, y, shift, 1);
          }
        }
      }
      scopeCtx.drawImage(history, left, top, right - left, bottom - top);
      scopeCtx.font = "9px monospace";
      scopeCtx.fillStyle = "#9ba595";
      for (let i = 0; i <= 8; i++) {
        const x = left + ((right - left) * i) / 8;
        if (state.grid) {
          scopeCtx.strokeStyle = "#65715c55";
          scopeCtx.beginPath();
          scopeCtx.moveTo(x, top);
          scopeCtx.lineTo(x, bottom);
          scopeCtx.stroke();
        }
        scopeCtx.fillText(
          i === 8 ? "now" : `−${8 - i}s`,
          Math.min(x, right - 20),
          h - 27,
        );
      }
      for (const freq of [100, 1000, 10000])
        scopeCtx.fillText(
          freq >= 1000 ? `${freq / 1000}k` : `${freq}`,
          3,
          bottom - (Math.log10(freq / 20) / 3) * (bottom - top),
        );
    }
  }
  function renderFrame(timestamp) {
    frameId = null;
    if (document.hidden) return;
    if (timestamp - lastFrame >= 33) {
      lastFrame = timestamp;
      if (state.ready) {
        CHANNEL_IDS.forEach((id) => {
          const value = channels[id].meter.getValue(),
            level = Array.isArray(value) ? Math.max(...value) : value;
          meterElements[id].style.transform =
            `scaleX(${clamp((level + 60) / 60, 0, 1)})`;
        });
        const value = outputMeter.getValue(),
          level = Array.isArray(value) ? Math.max(...value) : value;
        $("signalState").textContent = Number.isFinite(level)
          ? `RMS ${level.toFixed(1)} dBFS`
          : state.playing
            ? "SIGNAL SILENT"
            : "STOPPED";
        const c = channels[state.selected],
          cursor = $("loopCursor");
        if (cursor && c.loop.event !== null)
          cursor.style.left = `${(Math.max(0, (Tone.immediate() - c.loop.start) % c.loop.interval) / c.loop.interval) * 100}%`;
      }
      if (!state.hold) drawVisualization(timestamp);
    }
    if (state.ready && (state.playing || timestamp < visualUntil)) {
      frameId = requestAnimationFrame(renderFrame);
    } else if (state.ready) {
      CHANNEL_IDS.forEach(
        (id) => (meterElements[id].style.transform = "scaleX(0)"),
      );
      $("signalState").textContent = "STOPPED";
    }
  }
  function startVisualization() {
    if (frameId === null && !document.hidden)
      frameId = requestAnimationFrame(renderFrame);
  }
  document.addEventListener("visibilitychange", () => {
    lastSpectralTime = 0;
    if (document.hidden) {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    } else startVisualization();
  });
  Tone.context.rawContext.addEventListener("statechange", () => {
    if (!state.ready) return;
    const running = Tone.context.state === "running";
    $("audioStatus").textContent = running
      ? state.playing
        ? "PLAYING"
        : "READY / STOPPED"
      : "AUDIO SUSPENDED";
    $("audioDot").classList.toggle("on", running);
    $("startButton").textContent = running ? "Audio ready" : "Resume audio";
  });
  $("visual-settings").innerHTML =
    slider("visual-zoomX", "Zoom X", state.zoomX, 1, 8, (n) => `${n}×`) +
    slider("visual-zoomY", "Zoom Y", state.zoomY, 1, 8, (n) => `${n}×`) +
    slider("visual-glow", "Glow", state.glow) +
    slider("visual-trail", "Trail", state.trail) +
    slider("visual-line", "Line", state.line, 1, 4, (n) => `${n} px`) +
    `<div class="field"><button id="vizGrid" aria-pressed="true">Grid on</button><button id="vizReset">Reset view</button></div>`;
  document.querySelectorAll("[data-viz]").forEach((button) =>
    button.addEventListener("click", () => {
      state.viz = button.dataset.viz;
      state.hold = false;
      heldWave = null;
      lastSpectralTime = 0;
      document.querySelectorAll("[data-viz]").forEach((el) => {
        const selected = el === button;
        el.setAttribute("aria-selected", selected);
        el.tabIndex = selected ? 0 : -1;
      });
      $("visual-display").setAttribute("aria-labelledby", button.id);
      $("vizHold").hidden = state.viz !== "wave";
      $("vizHold").setAttribute("aria-pressed", "false");
      $("vizClear").hidden = state.viz !== "spectrogram";
      $("vizDescription").textContent = `POST FX / ${state.viz.toUpperCase()}`;
      scope.setAttribute("aria-label", `Live master output ${state.viz}`);
      document
        .querySelectorAll("#visual-settings .parameter")
        .forEach((el) => (el.hidden = state.viz !== "wave"));
      drawVisualization(performance.now(), true);
    }),
  );
  $("vizPause").addEventListener("click", () => {
    state.paused = !state.paused;
    $("vizPause").textContent = state.paused ? "Resume" : "Pause";
    $("vizPause").setAttribute("aria-pressed", state.paused);
    lastSpectralTime = 0;
  });
  $("vizHold").addEventListener("click", () => {
    state.hold = !state.hold;
    heldWave = state.hold ? waveformAnalyser.getValue().slice() : null;
    $("vizHold").setAttribute("aria-pressed", state.hold);
    drawVisualization(performance.now(), true);
  });
  $("vizClear").addEventListener("click", () => {
    historyCtx.clearRect(0, 0, history.width, history.height);
    drawVisualization(performance.now(), true);
  });
  $("vizSettings").addEventListener("click", () => {
    const panel = $("visual-settings");
    panel.hidden = !panel.hidden;
    $("vizSettings").setAttribute("aria-expanded", !panel.hidden);
  });
  $("vizGrid").addEventListener("click", () => {
    state.grid = !state.grid;
    $("vizGrid").setAttribute("aria-pressed", state.grid);
    $("vizGrid").textContent = state.grid ? "Grid on" : "Grid off";
    drawVisualization(performance.now(), true);
  });
  $("vizReset").addEventListener("click", () => {
    Object.assign(state, { zoomX: 1, zoomY: 2, glow: 15, trail: 18, line: 1 });
    for (const key of ["zoomX", "zoomY", "glow", "trail", "line"]) {
      const el = $(`visual-${key}`);
      el.value = state[key];
      updateSlider(el);
    }
    drawVisualization(performance.now(), true);
  });

  updateNotePools();
  applyGlobal();
  masterReverb.decay = 1.2 + state.smear / 24;
  applyScene("fog");
  syncChannels();
  renderEditor();
  updateSlider($("output"));
  $("outputValue").textContent = db(state.output / 100);
})();
