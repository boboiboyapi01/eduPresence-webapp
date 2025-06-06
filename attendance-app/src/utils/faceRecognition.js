import * as faceapi from 'face-api.js';

const MODEL_URL = '/models'; // Sesuaikan dengan lokasi model Anda di public/models

const loadModels = async () => {
  try {
    console.log('Loading face-api.js models...');
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log('Models loaded successfully');
  } catch (error) {
    console.error('Error loading models:', error);
    throw error;
  }
};

const detectFace = async (videoElement) => {
  try {
    console.log('Detecting face...');
    const detection = await faceapi.detectSingleFace(videoElement).withFaceLandmarks().withFaceDescriptor();
    if (!detection) {
      throw new Error('No face detected');
    }
    console.log('Face detected:', detection);
    return detection.descriptor; // Kembalikan deskriptor wajah
  } catch (error) {
    console.error('Error detecting face:', error);
    throw error;
  }
};

const compareFaces = (descriptor1, descriptor2) => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  console.log('Face comparison distance:', distance);
  return distance < 0.6; // Threshold 0.6 biasanya digunakan untuk verifikasi wajah
};

export { loadModels, detectFace, compareFaces };