import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MOCK_EXERCISES } from '../../constants';
import { generateExerciseFeedback } from '../../services/geminiService';
import { PlayIcon, PauseIcon, ListIcon, SparklesIcon } from '../icons/Icons';

const WorkoutPage: React.FC = () => {
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [reps, setReps] = useState(0);
    const [timer, setTimer] = useState(MOCK_EXERCISES[0].duration || 0);
    const [feedback, setFeedback] = useState<{ type: 'good' | 'bad' | 'ai'; message: string } | null>(null);
    const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
    const [showExerciseList, setShowExerciseList] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isTrackingReps, setIsTrackingReps] = useState(false);
    const [isRepCooldown, setIsRepCooldown] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const repTrackerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

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

    useEffect(() => {
        if (isTrackingReps && currentExercise.reps > 0) {
            repTrackerRef.current = setInterval(() => {
                setReps(prevReps => {
                    const newReps = prevReps + 1;
                    if (newReps >= currentExercise.reps) {
                        handleNextExercise();
                        return 0;
                    }
                    setIsRepCooldown(true);
                    setTimeout(() => setIsRepCooldown(false), 300);
                    return newReps;
                });
            }, 2000); // Simulate one rep every 2 seconds
        } else {
            if (repTrackerRef.current) {
                clearInterval(repTrackerRef.current);
            }
        }
        return () => {
            if (repTrackerRef.current) clearInterval(repTrackerRef.current);
        };
    }, [isTrackingReps, currentExercise.reps, handleNextExercise]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const setupCamera = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraError("Your browser does not support camera access.");
                return;
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        console.log('Pose estimation data can be processed from this video stream.');
                    };
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                if (err instanceof Error) {
                    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                        setCameraError("Camera access denied. Please enable it in your browser settings to use this feature.");
                    } else {
                        setCameraError("Could not access camera. Is it being used by another app?");
                    }
                } else {
                    setCameraError("An unknown error occurred while accessing the camera.");
                }
            }
        };
        setupCamera();
        
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
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
        <div className="container mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
            <div className="flex-grow lg:w-2/3 bg-dark-card rounded-lg shadow-xl flex flex-col items-center justify-center p-4">
                <div className="w-full h-full min-h-[480px] bg-black rounded-md flex items-center justify-center relative overflow-hidden">
                    {cameraError ? (
                        <div className="text-center text-red-400 p-4">
                            <p className="font-semibold">Camera Error</p>
                            <p>{cameraError}</p>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scaleX-[-1]"
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
                <div className="flex items-center gap-4 mt-4 flex-wrap justify-center">
                    <button onClick={handleToggleWorkout} className="flex items-center gap-2 bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors" aria-label={isWorkoutActive ? "Pause workout" : "Start workout"}>
                        {isWorkoutActive ? <PauseIcon className="h-6 w-6"/> : <PlayIcon className="h-6 w-6"/>}
                        <span>{isWorkoutActive ? 'Pause' : 'Start'}</span>
                    </button>
                    {currentExercise.reps > 0 && (
                         <button onClick={() => setIsTrackingReps(prev => !prev)} className={`flex items-center gap-2 text-white font-bold py-3 px-6 rounded-full transition-colors ${isTrackingReps ? 'bg-accent-red hover:bg-red-700' : 'bg-accent-green hover:bg-green-700'}`} aria-label="Track Reps">
                            <span>{isTrackingReps ? 'Stop Tracking' : 'Track Reps'}</span>
                        </button>
                    )}
                    <button onClick={() => setShowExerciseList(prev => !prev)} className="flex lg:hidden items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-colors" aria-label="Toggle exercise list">
                        <ListIcon className="h-6 w-6"/>
                        <span>{showExerciseList ? 'Show Status' : 'Show List'}</span>
                    </button>
                </div>
            </div>

            <div className={`w-full lg:w-1/3`}>
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl p-6 h-full flex flex-col">
                    <div className={`${showExerciseList ? 'hidden' : 'block'} lg:block`}>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Current Exercise</h2>
                        <div className="text-center p-6 bg-gray-100 dark:bg-dark-primary rounded-lg mb-4">
                            <p className="text-3xl font-bold text-accent-blue">{currentExercise.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {currentExercise.reps > 0 && (
                                <div className={`bg-gray-100 dark:bg-dark-primary p-4 rounded-lg text-center transition-all duration-300 ${isRepCooldown ? 'ring-2 ring-accent-green' : ''}`}>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Reps</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{reps} / {currentExercise.reps}</p>
                                </div>
                            )}
                             {currentExercise.duration && (
                                <div className="bg-gray-100 dark:bg-dark-primary p-4 rounded-lg text-center col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                                    <p className="text-4xl font-mono font-bold text-gray-900 dark:text-white">{formatTime(timer)}</p>
                                </div>
                            )}
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">AI Feedback</h3>
                        <div className={`p-3 rounded-lg text-center text-white mb-2 min-h-[48px] flex items-center justify-center ${feedback?.type === 'ai' ? 'bg-blue-500' : feedback?.type === 'good' ? 'bg-accent-green' : 'bg-accent-red'}`}>
                            {isFetchingFeedback ? 'Getting tip...' : feedback?.message ?? 'Click "Get AI Tip" for help.'}
                        </div>
                        <button onClick={handleGetAIFeedback} disabled={isFetchingFeedback} className="w-full flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg mb-4 disabled:bg-gray-500">
                           <SparklesIcon className="h-5 w-5"/> Get AI Tip
                        </button>
                    </div>

                    <div className={`${showExerciseList ? 'block' : 'hidden'} lg:hidden`}>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Workout List</h2>
                        <ul className="space-y-2">
                            {MOCK_EXERCISES.map((ex, index) => (
                                <li key={index} className={`p-3 rounded-lg cursor-pointer ${index === currentExerciseIndex ? 'bg-accent-blue text-white' : 'bg-gray-100 dark:bg-dark-primary'}`} onClick={() => setCurrentExerciseIndex(index)}>
                                    <span className="font-semibold">{ex.name}</span>
                                    <span className="text-sm ml-2">{ex.reps ? `${ex.reps} reps` : `${ex.duration}s`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-auto pt-4">
                        <button onClick={handleNextExercise} className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg">
                            Next Exercise &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutPage;
