//Get the circle element
const circle = document.getElementById("circle");

//Check if the browser supports the Web Audio API
async function setupAudio() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("getUserMedia not supported in this browser.");
    }

    console.log("Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone access granted.");

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.58;
    analyser.fftSize = 512;

    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    scriptProcessor.onaudioprocess = () => {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const average = array.reduce((a, b) => a + b) / array.length;

      const scale = Math.max(1, average / 20);
      circle.style.transform = `scale(${scale})`;

      const colorValue = Math.min(255, average * 2);
      circle.style.backgroundColor = `rgb(${colorValue}, 0, 0)`;
    };
  } catch (err) {
    console.error("Error setting up audio:", err);
    alert("Error setting up audio: " + err.message);
  }
}

setupAudio();
