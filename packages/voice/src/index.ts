export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceCommand {
  keywords: string[];
  action: string;
  description: string;
  parameters?: Record<string, string>;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private commands: VoiceCommand[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
        this.recognition.lang = 'en-US';
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(options: SpeechRecognitionOptions = {}, onResult: (result: SpeechRecognitionResult) => void): void {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      return;
    }

    if (options.language) {
      this.recognition.lang = options.language;
    }
    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous;
    }
    if (options.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults;
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      onResult({
        transcript,
        confidence,
        isFinal: result.isFinal,
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  registerCommand(command: VoiceCommand): void {
    this.commands.push(command);
  }

  processCommand(transcript: string): { action: string; parameters: Record<string, string> } | null {
    const normalizedTranscript = transcript.toLowerCase();

    for (const command of this.commands) {
      if (command.keywords.some(keyword => normalizedTranscript.includes(keyword))) {
        const parameters: Record<string, string> = {};
        
        if (command.parameters) {
          for (const [paramName, paramPattern] of Object.entries(command.parameters)) {
            const regex = new RegExp(paramPattern, 'i');
            const match = normalizedTranscript.match(regex);
            if (match) {
              parameters[paramName] = match[1] || match[0];
            }
          }
        }

        return {
          action: command.action,
          parameters,
        };
      }
    }

    return null;
  }

  addDefaultCommands(): void {
    this.registerCommand({
      keywords: ['schedule', 'appointment'],
      action: 'schedule_appointment',
      description: 'Schedule a new appointment',
    });

    this.registerCommand({
      keywords: ['show', 'patients'],
      action: 'show_patients',
      description: 'Show patient list',
    });

    this.registerCommand({
      keywords: ['vital signs', 'vitals'],
      action: 'record_vitals',
      description: 'Record vital signs',
    });

    this.registerCommand({
      keywords: ['lab results'],
      action: 'show_lab_results',
      description: 'Show lab results',
    });

    this.registerCommand({
      keywords: ['prescription', 'prescribe'],
      action: 'create_prescription',
      description: 'Create a prescription',
    });
  }
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      if (this.synthesis) {
        this.synthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices(): void {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }

  isSupported(): boolean {
    return this.synthesis !== null;
  }

  speak(text: string, options: { voice?: string; rate?: number; pitch?: number; volume?: number } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      if (options.voice) {
        const voice = this.voices.find(v => v.name === options.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.rate = options.rate ?? 1;
      utterance.pitch = options.pitch ?? 1;
      utterance.volume = options.volume ?? 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));

      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  speakConfirmation(message: string): Promise<void> {
    return this.speak(message, { rate: 0.9, pitch: 1 });
  }

  speakAlert(alert: string): Promise<void> {
    return this.speak(alert, { rate: 1.1, pitch: 1.1, volume: 1.2 });
  }
}

export const speechRecognition = new SpeechRecognitionService();
export const textToSpeech = new TextToSpeechService();

export function initializeVoiceAssistant(): void {
  if (speechRecognition.isSupported()) {
    speechRecognition.addDefaultCommands();
  }
}
