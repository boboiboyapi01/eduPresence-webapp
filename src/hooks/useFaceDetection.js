import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels } from '../utils/faceRecognition';

export const useFaceDetection = () => {
  const [descriptors, setDescriptors] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeModels = async () => {
      try {
        await loadModels();
        setModelsLoaded(true);
        console.log('Models initialized successfully');
      } catch (err) {
        setError(err.message);
        console.error('Model initialization failed:', err);
      }
    };
    initializeModels();
  }, []);

  const startFaceDetection = async (video, canvas) => {
    if (!modelsLoaded) {
      console.warn('Models not yet loaded');
      return false;
    }

    if (error) {
      console.error('Cannot start detection due to model error:', error);
      return false;
    }

    if (!video || !canvas) {
      console.warn('Video or canvas element is not available');
      return false;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log('Canvas dimensions set to:', canvas.width, 'x', canvas.height);

    try {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      console.log('Detections:', detections);

      const resizedDetections = faceapi.resizeResults(detections, {
        width: video.videoWidth,
        height: video.videoHeight
      });

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);

      if (detections.length > 0) {
        console.log('Face detected, descriptor:', detections[0].descriptor);
        setDescriptors([...descriptors, detections[0].descriptor]);
        return true;
      } else {
        console.log('No faces detected');
        return false;
      }
    } catch (err) {
      console.error('Error during face detection:', err);
      setError('Error during face detection: ' + err.message);
      return false;
    }
  };

  return { startFaceDetection, descriptors, modelsLoaded, error };
};