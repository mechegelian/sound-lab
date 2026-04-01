<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sound Lab</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app-shell">

    <header class="panel title-panel">
      <h1>sound L A B</h1>
      <p>super experimental browser synth playground by Mehmet</p>
    </header>

    <section class="panel transport-panel">
      <div class="transport-buttons">
        <button id="startButton">Start Audio</button>
        <button id="playAllButton">Play</button>
        <button id="stopAllButton">Stop</button>
        <button id="randomButton">Randomize</button>
      </div>
    </section>

    <section class="panel osc-panel">
      <div class="panel-head">
        <h2>oscilloscope</h2>

        <div class="osc-tools">
          <button id="pauseOscilloscopeButton">Pause Osc</button>
          <button id="resumeOscilloscopeButton">Resume Osc</button>

          <div class="mini-control">
            <label for="oscZoomX">Zoom X</label>
            <input type="range" id="oscZoomX" min="1" max="8" step="1" value="1">
          </div>

          <div class="mini-control">
            <label for="oscZoomY">Zoom Y</label>
            <input type="range" id="oscZoomY" min="1" max="8" step="1" value="2">
          </div>
        </div>
      </div>

      <canvas id="oscilloscope" width="1400" height="320"></canvas>
    </section>

    <section class="panel spec-panel">
      <div class="panel-head">
        <h2>spectrogram</h2>

        <div class="spec-tools">
          <button id="pauseSpectrogramButton">Pause Spec</button>
          <button id="resumeSpectrogramButton">Resume Spec</button>
          <button id="clearSpectrogramButton">Clear Spec</button>
        </div>
      </div>

      <div class="spectrogram-wrapper">
        <canvas id="spectrogram" width="1400" height="220"></canvas>
        <canvas id="spectrogramOverlay" width="1400" height="220"></canvas>
      </div>
    </section>

    <main class="workspace-grid">
      <aside class="panel controls-panel">
        <h2>controls</h2>

        <div class="control-group">
          <label for="controlTargetSelect">Target</label>
          <select id="controlTargetSelect">
            <option value="master">Master</option>
            <option value="a">Drift Core</option>
            <option value="b">Low Engine</option>
            <option value="c">Air Reed</option>
            <option value="d">Sub Pulse</option>
            <option value="e">Wind Pipe</option>
          </select>
        </div>

        <div class="control-group">
          <label for="volumeSlider">Volume</label>
          <input type="range" id="volumeSlider" min="0" max="100" value="70">
        </div>

        <div class="control-group">
          <label for="filterSlider">Filter</label>
          <input type="range" id="filterSlider" min="0" max="100" value="50">
        </div>

        <div class="control-group">
          <label for="speedSlider">Speed</label>
          <input type="range" id="speedSlider" min="50" max="150" value="100">
        </div>

        <div class="control-group">
          <label for="distortionSlider">Distortion</label>
          <input type="range" id="distortionSlider" min="0" max="100" value="0">
        </div>

        <div class="sub-block">
          <h3>sound design</h3>

          <div class="control-group">
            <label for="subPulseFreq">Sub Freq</label>
            <input type="range" id="subPulseFreq" min="30" max="120" step="1" value="48">
            <div class="value-label" id="subPulseFreqValue">48Hz</div>
          </div>

          <div class="control-group">
            <label for="subPulseDetune">Sub Detune</label>
            <input type="range" id="subPulseDetune" min="0" max="12" step="0.1" value="2.5">
            <div class="value-label" id="subPulseDetuneValue">2.5Hz</div>
          </div>

          <div class="control-group">
            <label for="windPipeTone">Pipe Tone</label>
            <input type="range" id="windPipeTone" min="220" max="1400" step="1" value="620">
            <div class="value-label" id="windPipeToneValue">620Hz</div>
          </div>

          <div class="control-group">
            <label for="windPipeBreath">Pipe Breath</label>
            <input type="range" id="windPipeBreath" min="0" max="100" step="1" value="55">
            <div class="value-label" id="windPipeBreathValue">55%</div>
          </div>
        </div>
      </aside>

      <section class="right-stack">
        <section class="panel sounds-panel">
          <h2>sounds</h2>

          <div class="sound-row">
            <span>Drift Core</span>
            <button class="sound-toggle" id="textureAButton">OFF</button>
          </div>

          <div class="sound-row">
            <span>Low Engine</span>
            <button class="sound-toggle" id="textureBButton">OFF</button>
          </div>

          <div class="sound-row">
            <span>Air Reed</span>
            <button class="sound-toggle" id="textureCButton">OFF</button>
          </div>

          <div class="sound-row">
            <span>Sub Pulse</span>
            <button class="sound-toggle" id="textureDButton">OFF</button>
          </div>

          <div class="sound-row">
            <span>Wind Pipe</span>
            <button class="sound-toggle" id="textureEButton">OFF</button>
          </div>
        </section>

        <section class="panel effects-panel">
          <h2>manual effects</h2>

          <div class="effect-row">
            <div class="effect-title">Hit Up</div>
            <select id="hitUpTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <input type="range" id="hitUpDuration" min="0" max="2" step="0.1" value="0.8">
            <span id="hitUpDurationValue">0.8s</span>
            <button id="hitUpButton">Trigger</button>
          </div>

          <div class="effect-row">
            <div class="effect-title">Hit Down</div>
            <select id="hitDownTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <input type="range" id="hitDownDuration" min="0" max="2" step="0.1" value="0.8">
            <span id="hitDownDurationValue">0.8s</span>
            <button id="hitDownButton">Trigger</button>
          </div>

          <div class="effect-row">
            <div class="effect-title">Echo Burst</div>
            <select id="echoBurstTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <input type="range" id="echoBurstDuration" min="0" max="2" step="0.1" value="1">
            <span id="echoBurstDurationValue">1.0s</span>
            <button id="echoBurstButton">Trigger</button>
          </div>

          <div class="effect-row">
            <div class="effect-title">Muffle</div>
            <select id="muffleTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <input type="range" id="muffleDuration" min="0" max="2" step="0.1" value="1">
            <span id="muffleDurationValue">1.0s</span>
            <button id="muffleButton">Trigger</button>
          </div>

          <div class="effect-row">
            <div class="effect-title">Warp</div>
            <select id="warpTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <input type="range" id="warpDuration" min="0" max="2" step="0.1" value="1">
            <span id="warpDurationValue">1.0s</span>
            <button id="warpButton">Trigger</button>
          </div>
        </section>

        <section class="panel loops-panel">
          <h2>effect loops</h2>

          <div class="loop-row">
            <div class="loop-name">Hit Up</div>
            <select id="loopHitUpTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <div class="loop-slider-group">
              <label for="loopHitUpInterval">Interval</label>
              <input type="range" id="loopHitUpInterval" min="1" max="8" step="0.5" value="4">
              <span id="loopHitUpIntervalValue">4.0s</span>
            </div>
            <div class="loop-slider-group">
              <label for="loopHitUpDuration">Duration</label>
              <input type="range" id="loopHitUpDuration" min="0.2" max="4" step="0.1" value="2">
              <span id="loopHitUpDurationValue">2.0s</span>
            </div>
            <div class="loop-buttons">
              <button id="startLoopHitUpButton">Start</button>
              <button id="stopLoopHitUpButton">Stop</button>
            </div>
          </div>

          <div class="loop-row">
            <div class="loop-name">Hit Down</div>
            <select id="loopHitDownTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <div class="loop-slider-group">
              <label for="loopHitDownInterval">Interval</label>
              <input type="range" id="loopHitDownInterval" min="1" max="8" step="0.5" value="4">
              <span id="loopHitDownIntervalValue">4.0s</span>
            </div>
            <div class="loop-slider-group">
              <label for="loopHitDownDuration">Duration</label>
              <input type="range" id="loopHitDownDuration" min="0.2" max="4" step="0.1" value="2">
              <span id="loopHitDownDurationValue">2.0s</span>
            </div>
            <div class="loop-buttons">
              <button id="startLoopHitDownButton">Start</button>
              <button id="stopLoopHitDownButton">Stop</button>
            </div>
          </div>

          <div class="loop-row">
            <div class="loop-name">Echo</div>
            <select id="loopEchoTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <div class="loop-slider-group">
              <label for="loopEchoInterval">Interval</label>
              <input type="range" id="loopEchoInterval" min="1" max="8" step="0.5" value="4">
              <span id="loopEchoIntervalValue">4.0s</span>
            </div>
            <div class="loop-slider-group">
              <label for="loopEchoDuration">Duration</label>
              <input type="range" id="loopEchoDuration" min="0.2" max="4" step="0.1" value="2">
              <span id="loopEchoDurationValue">2.0s</span>
            </div>
            <div class="loop-buttons">
              <button id="startLoopEchoButton">Start</button>
              <button id="stopLoopEchoButton">Stop</button>
            </div>
          </div>

          <div class="loop-row">
            <div class="loop-name">Muffle</div>
            <select id="loopMuffleTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <div class="loop-slider-group">
              <label for="loopMuffleInterval">Interval</label>
              <input type="range" id="loopMuffleInterval" min="1" max="8" step="0.5" value="4">
              <span id="loopMuffleIntervalValue">4.0s</span>
            </div>
            <div class="loop-slider-group">
              <label for="loopMuffleDuration">Duration</label>
              <input type="range" id="loopMuffleDuration" min="0.2" max="4" step="0.1" value="2">
              <span id="loopMuffleDurationValue">2.0s</span>
            </div>
            <div class="loop-buttons">
              <button id="startLoopMuffleButton">Start</button>
              <button id="stopLoopMuffleButton">Stop</button>
            </div>
          </div>

          <div class="loop-row">
            <div class="loop-name">Warp</div>
            <select id="loopWarpTargetSelect">
              <option value="all">All Active</option>
              <option value="a">Drift Core</option>
              <option value="b">Low Engine</option>
              <option value="c">Air Reed</option>
              <option value="d">Sub Pulse</option>
              <option value="e">Wind Pipe</option>
            </select>
            <div class="loop-slider-group">
              <label for="loopWarpInterval">Interval</label>
              <input type="range" id="loopWarpInterval" min="1" max="8" step="0.5" value="4">
              <span id="loopWarpIntervalValue">4.0s</span>
            </div>
            <div class="loop-slider-group">
              <label for="loopWarpDuration">Duration</label>
              <input type="range" id="loopWarpDuration" min="0.2" max="4" step="0.1" value="2">
              <span id="loopWarpDurationValue">2.0s</span>
            </div>
            <div class="loop-buttons">
              <button id="startLoopWarpButton">Start</button>
              <button id="stopLoopWarpButton">Stop</button>
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>

  <script src="https://unpkg.com/tone"></script>
  <script src="app.js"></script>
</body>
</html>
