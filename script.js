const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureBtn = document.getElementById('capture');
const downloadBtn = document.getElementById('download');
const retakeBtn = document.getElementById('retake');
const filterSelect = document.getElementById('filter');
const shutterSound = document.getElementById('shutter-sound');

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert('Webcam error: ' + err);
  });

// Apply filter live
filterSelect.addEventListener('change', () => {
  video.style.filter = filterSelect.value;
});

// Capture photo
captureBtn.onclick = () => {
  // Flash sound
  shutterSound.play();

  // Apply filter to canvas
  context.filter = filterSelect.value;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Show canvas & buttons
  canvas.style.display = 'block';
  video.style.display = 'none';
  downloadBtn.style.display = 'inline-block';
  retakeBtn.style.display = 'inline-block';
  captureBtn.style.display = 'none';
};

// Retake photo
retakeBtn.onclick = () => {
  canvas.style.display = 'none';
  video.style.display = 'block';
  captureBtn.style.display = 'inline-block';
  downloadBtn.style.display = 'none';
  retakeBtn.style.display = 'none';
};

// Download photo
downloadBtn.onclick = () => {
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = 'filtered-photo.png';
  link.click();
};

