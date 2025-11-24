
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MOCK_EXERCISES } from '../../constants';
import { generateExerciseFeedback } from '../../services/geminiService';
import { analyzePose } from '../../services/poseEstimationService';
import { PlayIcon, PauseIcon, ListIcon, SparklesIcon } from '../icons/Icons';

const WorkoutPage: React.FC = () => {
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [reps, setReps] = useState(0);
    const [timer, setTimer] = useState(MOCK_EXERCISES[0].duration || 0);
    const [feedback, setFeedback] = useState<{ type: 'good' | 'bad' | 'ai' | 'info'; message: string } | null>(null);
    const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
    const [showExerciseList, setShowExerciseList] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [debugError, setDebugError] = useState<string | null>(null); // New state for technical error details
    const [isTrackingReps, setIsTrackingReps] = useState(false);
    const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
    
    const timerRef = useRef<number | null>(null);
    const poseDetectionFrameRef = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const currentExercise = MOCK_EXERCISES[currentExerciseIndex];

    const handleNextExercise = useCallback(() => {
        setIsTrackingReps(false);
        const nextIndex = (currentExerciseIndex + 1) % MOCK_EXERCISES.length;
        setCurrentExerciseIndex(nextIndex);
    }, [currentExerciseIndex]);
    
    const startTimer = useCallback(() => {
        if (currentExercise.duration) {
            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        handleNextExercise();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [currentExercise.duration, handleNextExercise]);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const enableCamera = async () => {
        setCameraError(null);
        setDebugError(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setCameraError("Your browser/app does not support camera access via web.");
            return;
        }

        try {
            // We use the simplest constraints possible to maximize compatibility
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    console.log('Pose estimation data can be processed from this video stream.');
                };
            }
            setCameraPermissionGranted(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            
            // Detailed error handling for debugging WebViews
            if (err instanceof Error) {
                setDebugError(`${err.name}: ${err.message}`);

                if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                    setCameraError("Access Denied. If you are in an app, the app developer must grant Camera permissions to the WebView.");
                } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                    setCameraError("No camera found. The app may not have hardware access.");
                } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                    setCameraError("Camera is currently in use by another application.");
                } else {
                    setCameraError("Could not access camera.");
                }
            } else {
                setCameraError("An unknown error occurred while accessing the camera.");
                setDebugError(JSON.stringify(err));
            }
            setCameraPermissionGranted(false);
        }
    };

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (isWorkoutActive) {
            startTimer();
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [isWorkoutActive, startTimer, stopTimer]);
    
    useEffect(() => {
        setReps(0);
        setTimer(currentExercise.duration || 0);
        setFeedback(null);
        setIsTrackingReps(false);
        if (isWorkoutActive) {
            stopTimer();
            startTimer();
        }
    }, [currentExercise, isWorkoutActive, startTimer, stopTimer]);

    // Pose Estimation Loop
    useEffect(() => {
        const runPoseDetection = async () => {
            if (videoRef.current && videoRef.current.readyState >= 3 && isTrackingReps) {
                const result = await analyzePose(videoRef.current, currentExercise.name);

                if (result.isRepCounted) {
                    setReps(prevReps => {
                        const newReps = prevReps + 1;
                        if (newReps >= currentExercise.reps) {
                            handleNextExercise();
                            return 0;
                        }
                        return newReps;
                    });
                }

                if (result.feedback) {
                    const isGoodFeedback = result.feedback.toLowerCase().includes('good') || result.feedback.toLowerCase().includes('excellent') || result.feedback.toLowerCase().includes('solid');
                    setFeedback({ type: isGoodFeedback ? 'good' : 'bad', message: result.feedback });
                }

                // Schedule next frame only if still tracking
                poseDetectionFrameRef.current = requestAnimationFrame(runPoseDetection);
            }
        };

        if (isTrackingReps && currentExercise.reps > 0) {
            setFeedback({ type: 'info', message: 'AI Vision Active. Start your reps!' });
            poseDetectionFrameRef.current = requestAnimationFrame(runPoseDetection);
        } else {
            if (poseDetectionFrameRef.current) {
                cancelAnimationFrame(poseDetectionFrameRef.current);
            }
        }

        return () => { if (poseDetectionFrameRef.current) cancelAnimationFrame(poseDetectionFrameRef.current) };
    }, [isTrackingReps, currentExercise, handleNextExercise]);


    const handleToggleWorkout = () => setIsWorkoutActive(prev => !prev);
    
    const handleGetAIFeedback = async () => {
        setIsFetchingFeedback(true);
        setFeedback(null);
        const tip = await generateExerciseFeedback(currentExercise.name);
        setFeedback({ type: 'ai', message: tip });
        setIsFetchingFeedback(false);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="container mx-auto p-4 md:p-8 flex flex-col gap-8">
            {/* Video Section */}
            <div className="w-full bg-dark-card rounded-lg shadow-xl flex flex-col items-center justify-center p-4">
                <div className="w-full aspect-video bg-black rounded-md flex items-center justify-center relative overflow-hidden max-h-[70vh]">
                    {cameraError ? (
                        <div className="text-center text-red-400 p-4 max-w-md">
                            <p className="font-semibold text-lg mb-2">Camera Error</p>
                            <p className="mb-2">{cameraError}</p>
                            {debugError && (
                                <p className="mb-4 text-xs font-mono bg-black/30 p-2 rounded text-gray-300">
                                    Debug Info: {debugError}
                                </p>
                            )}
                            <button 
                                onClick={enableCamera}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                            >
                                Retry Camera
                            </button>
                        </div>
                    ) : !cameraPermissionGranted ? (
                        <div className="text-center p-4">
                            <button 
                                onClick={enableCamera}
                                className="bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Enable Camera</span>
                            </button>
                            <p className="text-gray-400 mt-2 text-sm">Click to start video for pose tracking</p>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scaleX-[-1]"
                            >
                                Your browser does not support the video tag.
                            </video>
                            {isTrackingReps && (
                                <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    AI VISION ACTIVE
                                </div>
                            )}
                             {/* Pose Overlay Simulation */}
                            {isTrackingReps && (
                                <div className="absolute inset-0 pointer-events-none border-4 border-accent-blue/30 rounded-md"></div>
                            )}
                        </>
                    )}
                </div>
                
                {/* Controls Bar */}
                <div className="flex items-center gap-4 mt-4 flex-wrap justify-center w-full">
                    <button onClick={handleToggleWorkout} className="flex items-center gap-2 bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg" aria-label={isWorkoutActive ? "Pause workout" : "Start workout"}>
                        {isWorkoutActive ? <PauseIcon className="h-6 w-6"/> : <PlayIcon className="h-6 w-6"/>}
                        <span>{isWorkoutActive ? 'Pause' : 'Start'}</span>
                    </button>
                    {currentExercise.reps > 0 && (
                         <button 
                            onClick={() => {
                                if (!cameraPermissionGranted) {
                                    enableCamera();
                                } else {
                                    setIsTrackingReps(prev => !prev);
                                }
                            }} 
                            className={`flex items-center gap-2 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg ${!cameraPermissionGranted ? 'bg-gray-600 hover:bg-gray-700' : isTrackingReps ? 'bg-accent-red hover:bg-red-700' : 'bg-accent-green hover:bg-green-700'}`} 
                            aria-label="Track Reps"
                        >
                            <span>{isTrackingReps ? 'Stop Tracking' : 'Track Reps'}</span>
                        </button>
                    )}
                    <button onClick={() => setShowExerciseList(prev => !prev)} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-lg" aria-label="Toggle exercise list">
                        <ListIcon className="h-6 w-6"/>
                        <span>{showExerciseList ? 'Hide List' : 'Workout List'}</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Panel (Replaces Sidebar) */}
            <div className="w-full">
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-6 min-h-[200px] transition-all duration-300">
                    {showExerciseList ? (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plan</h2>
                                <button onClick={() => setShowExerciseList(false)} className="text-sm text-accent-blue hover:underline">Back to Dashboard</button>
                            </div>
                            <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {MOCK_EXERCISES.map((ex, index) => (
                                    <li key={index} className={`p-4 rounded-lg cursor-pointer border-2 ${index === currentExerciseIndex ? 'border-accent-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-100 dark:bg-dark-primary hover:bg-gray-200 dark:hover:bg-gray-700'}`} onClick={() => { setCurrentExerciseIndex(index); setShowExerciseList(false); }}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-900 dark:text-white">{ex.name}</span>
                                            <span className="text-sm bg-white dark:bg-dark-card px-2 py-1 rounded shadow-sm text-gray-600 dark:text-gray-300">{ex.reps ? `${ex.reps} reps` : `${ex.duration}s`}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                            {/* Column 1: Stats & Info */}
                            <div className="flex flex-col justify-between bg-gray-50 dark:bg-dark-primary p-6 rounded-lg shadow-inner">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Exercise</p>
                                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{currentExercise.name}</h2>
                                    </div>
                                    <div className="bg-white dark:bg-dark-card p-2 rounded-full shadow-sm">
                                        <DumbbellIcon className="h-6 w-6 text-accent-blue" />
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    {currentExercise.reps > 0 ? (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-extrabold text-accent-blue">{reps}</span>
                                            <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">/ {currentExercise.reps} reps</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-extrabold text-accent-blue font-mono">{formatTime(timer)}</span>
                                            <span className="text-xl text-gray-500 dark:text-gray-400 font-medium">seconds</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Feedback Display */}
                            <div className="flex flex-col bg-gray-50 dark:bg-dark-primary p-6 rounded-lg shadow-inner relative overflow-hidden">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-center">AI Feedback</h3>
                                <div className={`flex-grow flex items-center justify-center p-4 rounded-lg text-center text-white transition-all duration-500 shadow-md transform ${
                                    feedback?.type === 'ai' ? 'bg-blue-600 scale-100' 
                                    : feedback?.type === 'good' ? 'bg-accent-green scale-100' 
                                    : feedback?.type === 'bad' ? 'bg-accent-red scale-100' 
                                    : 'bg-gray-400 dark:bg-gray-600'
                                }`}>
                                    <p className="text-lg font-bold">
                                        {isFetchingFeedback ? 'Analyzing form...' : feedback?.message ?? 'Start moving for real-time feedback'}
                                    </p>
                                </div>
                            </div>

                            {/* Column 3: Actions */}
                            <div className="flex flex-col gap-4 justify-center">
                                <button onClick={handleGetAIFeedback} disabled={isFetchingFeedback} className="w-full flex justify-center items-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg disabled:bg-gray-500 transition-all hover:shadow-lg transform hover:-translate-y-1">
                                   <SparklesIcon className="h-6 w-6 text-yellow-300"/> 
                                   <span>Get AI Form Tip</span>
                                </button>
                                <button onClick={handleNextExercise} className="w-full bg-white dark:bg-dark-primary hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 font-bold py-4 px-6 rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-1 flex justify-center items-center gap-2">
                                    <span>Next Exercise</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Icon helper specifically for this component if not imported, 
// though imports are present. DumbbellIcon usage was added in design.
const DumbbellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.4 14.4 9.6 9.6M18 6l-1.4-1.4M6 18l-1.4-1.4M21 21 3 3"/>
        <path d="M14.4 9.6 9.6 14.4"/>
        <path d="M18 10h1a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-1"/>
        <path d="m5 11-2 2a3 3 0 0 0 0 4.2l2 2"/>
        <path d="m19 13-2-2a3 3 0 0 0-4.2 0l-2 2"/>
        <path d="M6 14H5a3 3 0 0 1-3-3v0a3 3 0 0 1 3-3h1"/>
    </svg>
);

export default WorkoutPage;
