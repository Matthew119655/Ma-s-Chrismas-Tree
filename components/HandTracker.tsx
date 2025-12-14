import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { cameraActive, setGesture } = useStore();
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // 1. 初始化 MediaPipe 模型
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        console.log("MediaPipe HandLandmarker loaded");
        setModelLoaded(true);
      } catch (error) {
        console.error("Failed to init MediaPipe:", error);
        setError("Failed to load AI model. Check connection.");
      }
    };

    initMediaPipe();
  }, []);

  // 2. 监听 cameraActive 状态切换摄像头
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive]);

  const startCamera = async () => {
    if (!videoRef.current) return;
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      // 只有当视频数据加载完成后才开始预测循环
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
    setGesture('None');
  };

  // 3. 核心检测循环 (detectLoop)
  const predictWebcam = () => {
    // 立即请求下一帧，确保循环不中断
    requestRef.current = requestAnimationFrame(predictWebcam);

    const video = videoRef.current;
    if (!video || !video.srcObject) return;

    // 只有当模型加载完毕且视频有尺寸时才进行检测
    if (handLandmarkerRef.current && video.videoWidth > 0 && video.videoHeight > 0) {
      try {
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

        if (results.gestures.length > 0) {
          const name = results.gestures[0][0].categoryName;
          
          // 根据置信度或名称更新状态
          if (name === 'Open_Palm') setGesture('Open_Palm');
          else if (name === 'Closed_Fist') setGesture('Closed_Fist');
          else setGesture('None');
        } else {
          setGesture('None');
        }
      } catch (e) {
        console.warn("MediaPipe detection error:", e);
      }
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-48 h-36 bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 shadow-2xl relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]" // 镜像翻转
        />
        <div className="absolute bottom-1 left-2 text-[10px] text-white/70 font-mono flex items-center gap-2">
          AI VISION
          {!modelLoaded && !error && <span className="animate-pulse text-yellow-400">Loading Model...</span>}
        </div>
        {error && (
            <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center p-2 text-center">
                <p className="text-white text-xs font-bold">{error}</p>
            </div>
        )}
      </div>
    </div>
  );
};