(() => {
  const video = document.getElementById('camera');
  const overlay = document.getElementById('overlay');
  const gestureLayer = document.getElementById('gestureLayer');
  const hint = document.getElementById('hint');
  const permissionError = document.getElementById('permissionError');
  const fileInput = document.getElementById('fileInput');
  const toolbar = document.getElementById('toolbar');

  const pickImageBtn = document.getElementById('pickImageBtn');
  const pickImageHint = document.getElementById('pickImageHint');
  const freezeBtn = document.getElementById('freezeBtn');
  const mirrorBtn = document.getElementById('mirrorBtn');
  const switchCamBtn = document.getElementById('switchCamBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const resetBtn = document.getElementById('resetBtn');
  const toggleToolbarBtn = document.getElementById('toggleToolbar');

  const opacitySlider = document.getElementById('opacitySlider');
  const scaleSlider = document.getElementById('scaleSlider');
  const rotationSlider = document.getElementById('rotationSlider');

  const state = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 0.5,
    mirrored: false,
    frozen: false,
    imageLoaded: false,
  };

  let videoDevices = [];
  let currentDeviceIndex = 0;
  let currentStream = null;

  function applyTransform() {
    const sx = state.mirrored ? -state.scale : state.scale;
    overlay.style.transform =
      `translate(-50%, -50%) translate(${state.x}px, ${state.y}px) rotate(${state.rotation}deg) scale(${sx}, ${state.scale})`;
    overlay.style.opacity = state.opacity;
  }

  function syncSlidersFromState() {
    opacitySlider.value = Math.round(state.opacity * 100);
    scaleSlider.value = Math.round(state.scale * 100);
    rotationSlider.value = Math.round(((state.rotation % 360) + 360) % 360);
  }

  applyTransform();

  // ---- Camera setup ----

  async function startCamera(deviceId) {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }

    const constraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: { ideal: 'environment' } },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream = stream;
      video.srcObject = stream;
      permissionError.classList.add('hidden');

      if (videoDevices.length === 0) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevices = devices.filter((d) => d.kind === 'videoinput');
      }
    } catch (err) {
      permissionError.classList.remove('hidden');
    }
  }

  async function switchCamera() {
    if (videoDevices.length < 2) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      videoDevices = devices.filter((d) => d.kind === 'videoinput');
    }
    if (videoDevices.length < 2) return;
    currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
    state.frozen = false;
    video.classList.remove('hidden');
    freezeBtn.classList.remove('active');
    await startCamera(videoDevices[currentDeviceIndex].deviceId);
  }

  // ---- Image loading ----

  function loadImageFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    overlay.onload = () => URL.revokeObjectURL(url);
    overlay.src = url;
    state.imageLoaded = true;
    hint.classList.add('hidden');
  }

  fileInput.addEventListener('change', () => {
    loadImageFile(fileInput.files[0]);
  });

  pickImageBtn.addEventListener('click', () => fileInput.click());
  pickImageHint.addEventListener('click', () => fileInput.click());

  // ---- Freeze / live toggle ----

  freezeBtn.addEventListener('click', () => {
    state.frozen = !state.frozen;
    if (state.frozen) {
      video.pause();
      freezeBtn.classList.add('active');
    } else {
      video.play();
      freezeBtn.classList.remove('active');
    }
  });

  // ---- Mirror ----

  mirrorBtn.addEventListener('click', () => {
    state.mirrored = !state.mirrored;
    mirrorBtn.classList.toggle('active', state.mirrored);
    applyTransform();
  });

  // ---- Switch camera ----

  switchCamBtn.addEventListener('click', switchCamera);

  // ---- Fullscreen ----

  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  });

  // ---- Reset ----

  resetBtn.addEventListener('click', () => {
    state.x = 0;
    state.y = 0;
    state.scale = 1;
    state.rotation = 0;
    applyTransform();
    syncSlidersFromState();
  });

  // ---- Sliders ----

  opacitySlider.addEventListener('input', () => {
    state.opacity = opacitySlider.value / 100;
    applyTransform();
  });

  scaleSlider.addEventListener('input', () => {
    state.scale = scaleSlider.value / 100;
    applyTransform();
  });

  rotationSlider.addEventListener('input', () => {
    state.rotation = Number(rotationSlider.value);
    applyTransform();
  });

  // ---- Toolbar visibility ----

  toggleToolbarBtn.addEventListener('click', () => {
    toolbar.classList.toggle('collapsed');
  });

  // ---- Drag / pinch-zoom / rotate gestures ----

  const pointers = new Map();
  let gestureStart = null;
  let tapCandidate = false;
  let tapStartTime = 0;

  function distanceBetween(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  function angleBetween(p1, p2) {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  }

  gestureLayer.addEventListener('pointerdown', (e) => {
    gestureLayer.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      tapCandidate = true;
      tapStartTime = Date.now();
      gestureStart = {
        mode: 'drag',
        startX: e.clientX,
        startY: e.clientY,
        origX: state.x,
        origY: state.y,
      };
    } else if (pointers.size === 2) {
      const pts = Array.from(pointers.values());
      gestureStart = {
        mode: 'pinch',
        startDist: distanceBetween(pts[0], pts[1]),
        startAngle: angleBetween(pts[0], pts[1]),
        origScale: state.scale,
        origRotation: state.rotation,
      };
    }
  });

  gestureLayer.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (!gestureStart) return;

    if (gestureStart.mode === 'drag' && pointers.size === 1) {
      const dx = e.clientX - gestureStart.startX;
      const dy = e.clientY - gestureStart.startY;
      if (Math.hypot(dx, dy) > 6) tapCandidate = false;
      state.x = gestureStart.origX + dx;
      state.y = gestureStart.origY + dy;
      applyTransform();
    } else if (gestureStart.mode === 'pinch' && pointers.size === 2) {
      tapCandidate = false;
      const pts = Array.from(pointers.values());
      const dist = distanceBetween(pts[0], pts[1]);
      const angle = angleBetween(pts[0], pts[1]);
      const scaleFactor = dist / gestureStart.startDist;
      state.scale = Math.max(0.1, Math.min(4, gestureStart.origScale * scaleFactor));
      state.rotation = gestureStart.origRotation + (angle - gestureStart.startAngle);
      applyTransform();
      syncSlidersFromState();
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);

    if (pointers.size === 1) {
      const [remaining] = Array.from(pointers.entries());
      const [id, pos] = remaining;
      gestureStart = {
        mode: 'drag',
        startX: pos.x,
        startY: pos.y,
        origX: state.x,
        origY: state.y,
      };
    } else if (pointers.size === 0) {
      if (tapCandidate && Date.now() - tapStartTime < 300) {
        toolbar.classList.toggle('collapsed');
      }
      gestureStart = null;
    }
  }

  gestureLayer.addEventListener('pointerup', endPointer);
  gestureLayer.addEventListener('pointercancel', endPointer);

  // ---- Init ----

  startCamera();
  syncSlidersFromState();
})();
