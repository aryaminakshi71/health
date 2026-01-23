'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface UseSpeechToTextOptions {
    continuous?: boolean;
    lang?: string;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = options.continuous ?? true;
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = options.lang ?? 'en-IN';

                recognitionInstance.onresult = (event: any) => {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    setTranscript(prev => prev + finalTranscript);
                };

                recognitionInstance.onerror = (event: any) => {
                    setError(event.error);
                    setIsListening(false);
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                };

                setRecognition(recognitionInstance);
            } else {
                setError('Speech recognition not supported');
            }
        }
    }, [options.continuous, options.lang]);

    const startListening = useCallback(() => {
        if (recognition) {
            setError(null);
            setIsListening(true);
            recognition.start();
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    const appendTranscript = useCallback((text: string) => {
        setTranscript(prev => prev + text);
    }, []);

    return {
        transcript,
        isListening,
        error,
        startListening,
        stopListening,
        resetTranscript,
        appendTranscript,
        setTranscript,
        isSupported: !!recognition,
    };
}
