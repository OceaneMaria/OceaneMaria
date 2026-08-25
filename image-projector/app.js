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
  const sketchBtn = document.getElementById('sketchBtn');
  const sketchThresholdRow = document.getElementById('sketchThresholdRow');
  const sketchThresholdSlider = document.getElementById('sketchThresholdSlider');
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
    sketchMode: false,
    sketchThreshold: Number(sketchThresholdSlider.value),
  };

  let videoDevices = [];
  let currentDeviceIndex = 0;
  let currentStream = null;

  let sourceImage = null; // Image originale chargée par l'utilisateur
  let sketchData = null; // { width, height, magnitude } contours pré-calculés
  let sketchRenderPending = false;

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

  let previousImageURL = null;

  function loadImageFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (previousImageURL) URL.revokeObjectURL(previousImageURL);
      previousImageURL = url;
      sourceImage = img;
      sketchData = null;
      state.imageLoaded = true;
      sketchBtn.disabled = false;
      hint.classList.add('hidden');
      updateOverlayImage();
    };
    img.src = url;
  }

  fileInput.addEventListener('change', () => {
    loadImageFile(fileInput.files[0]);
  });

  pickImageBtn.addEventListener('click', () => fileInput.click());
  pickImageHint.addEventListener('click', () => fileInput.click());

  // ---- Style dessin (détection de contours) ----

  function updateOverlayImage() {
    if (!sourceImage) return;
    if (state.sketchMode) {
      if (!sketchData) sketchData = computeSketchData(sourceImage);
      overlay.src = renderSketch(sketchData, state.sketchThreshold);
    } else {
      overlay.src = sourceImage.src;
    }
  }

  function computeSketchData(img) {
    const maxDim = 1000;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    const gray = new Float32Array(w * h);
    for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
      gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
    }

    const rawMagnitude = new Float32Array(w * h);
    let maxMagnitude = 0;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const tl = gray[i - w - 1], t = gray[i - w], tr = gray[i - w + 1];
        const l = gray[i - 1], r = gray[i + 1];
        const bl = gray[i + w - 1], b = gray[i + w], br = gray[i + w + 1];

        const gx = -tl + tr - 2 * l + 2 * r - bl + br;
        const gy = -tl - 2 * t - tr + bl + 2 * b + br;
        const mag = Math.sqrt(gx * gx + gy * gy);

        rawMagnitude[i] = mag;
        if (mag > maxMagnitude) maxMagnitude = mag;
      }
    }

    const magnitude = new Uint8ClampedArray(w * h);
    const norm = maxMagnitude > 0 ? 255 / maxMagnitude : 0;
    for (let i = 0; i < rawMagnitude.length; i++) {
      magnitude[i] = rawMagnitude[i] * norm;
    }

    return { width: w, height: h, magnitude };
  }

  function renderSketch(data, threshold) {
    const { width, height, magnitude } = data;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const out = imageData.data;

    for (let i = 0; i < magnitude.length; i++) {
      const alpha = Math.min(255, Math.max(0, (magnitude[i] - threshold) * 3));
      const p = i * 4;
      out[p] = 0;
      out[p + 1] = 0;
      out[p + 2] = 0;
      out[p + 3] = alpha;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  function scheduleSketchRender() {
    if (sketchRenderPending) return;
    sketchRenderPending = true;
    requestAnimationFrame(() => {
      sketchRenderPending = false;
      if (state.sketchMode && sketchData) {
        overlay.src = renderSketch(sketchData, state.sketchThreshold);
      }
    });
  }

  sketchBtn.addEventListener('click', () => {
    if (!sourceImage) return;
    state.sketchMode = !state.sketchMode;
    sketchBtn.classList.toggle('active', state.sketchMode);
    sketchThresholdRow.classList.toggle('hidden', !state.sketchMode);
    updateOverlayImage();
  });

  sketchThresholdSlider.addEventListener('input', () => {
    state.sketchThreshold = Number(sketchThresholdSlider.value);
    scheduleSketchRender();
  });

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
