import { AudioRecording, SampleRecording, TranscriptSegment } from '../types';

// SpeechRecognition type declarations for browser window
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const SAMPLE_RECORDINGS: SampleRecording[] = [
  {
    id: 'sample-1',
    title: 'AI Product Strategy & Q4 Roadmap',
    description: 'Executive pitch on scaling generative AI agent workflows & modern UI architectures.',
    duration: 124,
    category: 'Business Strategy',
    transcript: 'Welcome everyone to our Q4 AI Product Strategy review. Today we are aligning on three primary pillars: autonomous agent orchestration, low-latency audio processing, and customizable note synthesis. Speaker 1 highlighted that 84% of user friction in meetings comes from manual note taking. Our key objective for Q4 is launching one-click transcript conversion into executive briefs and action items. Action items include: First, optimize client-side Web Audio synthesis by October 15th. Second, deliver theme customization across OLED, Dark, and Light modes. Third, complete security audits for browser-based API keys.',
    segments: [
      { id: 'seg-1', speaker: 'Speaker 1 (Product Director)', startTime: 0, endTime: 30, text: 'Welcome everyone to our Q4 AI Product Strategy review. Today we are aligning on three primary pillars: autonomous agent orchestration, low-latency audio processing, and customizable note synthesis.' },
      { id: 'seg-2', speaker: 'Speaker 1 (Product Director)', startTime: 30, endTime: 70, text: 'Speaker 1 highlighted that 84% of user friction in meetings comes from manual note taking. Our key objective for Q4 is launching one-click transcript conversion into executive briefs and action items.' },
      { id: 'seg-3', speaker: 'Speaker 2 (Engineering Lead)', startTime: 70, endTime: 124, text: 'Action items include: First, optimize client-side Web Audio synthesis by October 15th. Second, deliver theme customization across OLED, Dark, and Light modes. Third, complete security audits for browser-based API keys.' }
    ]
  },
  {
    id: 'sample-2',
    title: 'Quantum Physics: Wave-Particle Duality',
    description: 'Lecture notes covering double-slit experiment, Planck hypothesis, and superposition.',
    duration: 185,
    category: 'Academia & Physics',
    transcript: 'In today\'s physics seminar, we explore the fundamental tenets of quantum physics, specifically wave-particle duality and Heisenberg\'s Uncertainty Principle. Light exhibits both wave-like interference patterns in the double-slit experiment and particle-like discrete photon interactions in the photoelectric effect. Formula to remember: E equals h nu, where h is Planck\'s constant 6.626 times 10 to the power of minus 34 Joule seconds. Key Takeaway for the exam: superposition collapses into a definitive eigenstate upon measurement.',
    segments: [
      { id: 'seg-21', speaker: 'Prof. Miller', startTime: 0, endTime: 55, text: 'In today\'s physics seminar, we explore the fundamental tenets of quantum physics, specifically wave-particle duality and Heisenberg\'s Uncertainty Principle.' },
      { id: 'seg-22', speaker: 'Prof. Miller', startTime: 55, endTime: 120, text: 'Light exhibits both wave-like interference patterns in the double-slit experiment and particle-like discrete photon interactions in the photoelectric effect.' },
      { id: 'seg-23', speaker: 'Prof. Miller', startTime: 120, endTime: 185, text: 'Formula to remember: E equals h nu, where h is Planck\'s constant 6.626 times 10 to the power of minus 34 Joule seconds. Key Takeaway for the exam: superposition collapses into a definitive eigenstate upon measurement.' }
    ]
  },
  {
    id: 'sample-3',
    title: 'Agile Team Retrospective & Sprint Sync',
    description: 'Engineering team retrospective on deployment pipelines and UX responsiveness.',
    duration: 98,
    category: 'Agile Team Standup',
    transcript: 'Team retro notes: Overall velocity increased by 18% this sprint. What went well: deployment automation with Docker and zero-downtime rollouts. What needs improvement: API error logging was inconsistent during peak traffic. Action item for Sarah: implement global error boundaries and Toast notifications by Friday. Action item for Alex: conduct database indexing review on user analytics table. Next sprint goal: achieve 99.9% uptime and under 100 millisecond response times.',
    segments: [
      { id: 'seg-31', speaker: 'Scrum Master', startTime: 0, endTime: 25, text: 'Team retro notes: Overall velocity increased by 18% this sprint.' },
      { id: 'seg-32', speaker: 'Alex (DevOps)', startTime: 25, endTime: 60, text: 'What went well: deployment automation with Docker and zero-downtime rollouts. What needs improvement: API error logging was inconsistent during peak traffic.' },
      { id: 'seg-33', speaker: 'Sarah (Frontend)', startTime: 60, endTime: 98, text: 'Action item for Sarah: implement global error boundaries and Toast notifications by Friday. Action item for Alex: conduct database indexing review on user analytics table. Next sprint goal: achieve 99.9% uptime and under 100 millisecond response times.' }
    ]
  }
];

export function cleanFillerWords(text: string): string {
  const fillers = [
    /\bum\b/gi,
    /\bah\b/gi,
    /\buh\b/gi,
    /\blike\b/gi,
    /\byou know\b/gi,
    /\bso basically\b/gi,
    /\bi mean\b/gi
  ];
  let cleaned = text;
  fillers.forEach(regex => {
    cleaned = cleaned.replace(regex, '');
  });
  return cleaned.replace(/\s+/g, ' ').trim();
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export class SpeechRecorderService {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  public isRecording = false;
  public isPaused = false;
  public transcript = '';
  public interimTranscript = '';
  public startTime = 0;

  private onTranscriptUpdateCallback?: (transcript: string, isFinal: boolean) => void;
  private onAudioLevelCallback?: (level: number) => void;

  constructor() {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalChunk += result[0].transcript + ' ';
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (finalChunk) {
          this.transcript += finalChunk;
        }
        this.interimTranscript = currentInterim;

        if (this.onTranscriptUpdateCallback) {
          this.onTranscriptUpdateCallback(this.transcript + this.interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
      };
    }
  }

  public setCallbacks(
    onTranscriptUpdate: (transcript: string, isFinal: boolean) => void,
    onAudioLevel?: (level: number) => void
  ) {
    this.onTranscriptUpdateCallback = onTranscriptUpdate;
    this.onAudioLevelCallback = onAudioLevel;
  }

  public async startRecording(): Promise<boolean> {
    try {
      this.transcript = '';
      this.interimTranscript = '';
      this.audioChunks = [];
      this.startTime = Date.now();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Web Audio API Analyser for Waveform visualizer
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      this.monitorAudioLevel();

      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250);

      // Start SpeechRecognition
      if (this.recognition) {
        this.recognition.start();
      }

      this.isRecording = true;
      this.isPaused = false;
      return true;
    } catch (err) {
      console.error('Error starting audio recording:', err);
      return false;
    }
  }

  private monitorAudioLevel() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.isRecording || !this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      if (this.onAudioLevelCallback) {
        this.onAudioLevelCallback(average);
      }
      this.animFrameId = requestAnimationFrame(update);
    };
    update();
  }

  public stopRecording(): Promise<{ audioUrl: string; transcript: string; duration: number }> {
    return new Promise((resolve) => {
      this.isRecording = false;

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
      }

      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }

      const duration = Math.round((Date.now() - this.startTime) / 1000);

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (this.audioContext) {
            this.audioContext.close();
          }

          const fullTranscript = (this.transcript + ' ' + this.interimTranscript).trim();
          resolve({
            audioUrl,
            transcript: fullTranscript || 'Audio recorded successfully. (No spoken speech detected).',
            duration
          });
        };
        this.mediaRecorder.stop();
      } else {
        const fullTranscript = (this.transcript + ' ' + this.interimTranscript).trim();
        resolve({
          audioUrl: '',
          transcript: fullTranscript || 'Audio recorded successfully.',
          duration
        });
      }
    });
  }
}
