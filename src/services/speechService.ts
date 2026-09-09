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
  if (!text || !text.trim()) return '';

  const fillerPatterns = [
    /\b(?:um|uh|ah|hmm|er|erm)\b/gi,
    /\b(?:like|literally|basically|actually|sort of|kind of)\b/gi,
    /\b(?:you know|i mean|so basically|you know what i mean)\b/gi,
    /\b(?:okay|alright|so)\b/gi
  ];

  let cleaned = text.replace(/\s+/g, ' ').trim();

  // Remove duplicate word sequences created by interrupted recognition.
  cleaned = cleaned.replace(/\b([A-Za-z]+)(?:\s+\1)+\b/gi, '$1');

  // Remove filler words and awkward spoken fragments.
  fillerPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Clean spacing and punctuation after removing filler words.
  cleaned = cleaned.replace(/\s+([,.!?;:])/g, '$1');
  cleaned = cleaned.replace(/([,.!?;:]){2,}/g, '$1');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // Rebuild a cleaner sentence flow when a phrase was broken into fragments.
  cleaned = cleaned.replace(/\s+([,.!?;:])\s+/g, '$1 ');

  return cleaned.replace(/\s+/g, ' ').trim();
}

export function getTranscriptQualityScore(text: string): number {
  const normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return 0;

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  const uniqueWords = new Set(words.map((word) => word.toLowerCase().replace(/[^a-z0-9]/gi, ''))).size;
  const diversity = uniqueWords / words.length;
  const punctuationScore = /[.!?]/.test(normalized) ? 1 : 0.2;
  const repeatedWordPenalty = (normalized.match(/\b(\w+)(?:\s+\1)+\b/gi) || []).length * 0.2;
  const fillerPenalty = (normalized.match(/\b(?:um|uh|ah|like|you know|i mean|so basically|basically|literally)\b/gi) || []).length * 0.12;
  const lengthScore = Math.min(words.length / 60, 1);

  const score = (diversity * 0.45) + (lengthScore * 0.3) + (punctuationScore * 0.25) - repeatedWordPenalty - fillerPenalty;
  return Math.max(0, Math.min(1, score));
}

export function isTranscriptLikelyLowQuality(text: string, durationSeconds = 0): boolean {
  const normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return true;

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length < 6) return true;

  const durationThreshold = durationSeconds > 20 ? Math.max(12, Math.round(durationSeconds / 6)) : 6;
  if (durationSeconds > 0 && words.length < durationThreshold) return true;

  return getTranscriptQualityScore(normalized) < 0.35;
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
  private recordingStartTimestamp = 0;
  private pauseStartedAt = 0;
  private pausedDurationMs = 0;
  private recognitionRestartScheduled = false;
  public language = 'en-US';

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
      this.recognition.lang = this.language;

      this.recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            const transcript = result[0]?.transcript ?? '';
            finalChunk += transcript + ' ';
          } else {
            currentInterim += result[0]?.transcript ?? '';
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

      this.recognition.onend = () => {
        if (!this.isRecording || this.isPaused) return;

        this.restartRecognition();
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);

        if (this.isRecording && !this.isPaused && ['no-speech', 'audio-capture', 'aborted'].includes(event.error)) {
          this.restartRecognition();
        }
      };
    }
  }

  private restartRecognition(): void {
    if (!this.recognition || !this.isRecording || this.isPaused || this.recognitionRestartScheduled) {
      return;
    }

    this.recognitionRestartScheduled = true;

    window.setTimeout(() => {
      this.recognitionRestartScheduled = false;

      if (!this.recognition || !this.isRecording || this.isPaused) {
        return;
      }

      try {
        this.recognition.start();
      } catch (e) {
        console.debug('Speech recognition restart attempted while already active:', e);
      }
    }, 150);
  }

  public setLanguage(language: string): void {
    this.language = language || 'en-US';
    if (this.recognition) {
      this.recognition.lang = this.language;
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
      this.recordingStartTimestamp = Date.now();
      this.pauseStartedAt = 0;
      this.pausedDurationMs = 0;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Setup Web Audio API Analyser for Waveform visualizer
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      this.monitorAudioLevel();

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

      this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250);

      this.isRecording = true;
      this.isPaused = false;
      this.recognitionRestartScheduled = false;

      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          console.warn('Speech recognition already active:', e);
        }
      }

      return true;
    } catch (err) {
      console.error('Error starting audio recording:', err);
      return false;
    }
  }

  public pauseRecording(): boolean {
    if (!this.isRecording || this.isPaused) return false;

    this.isPaused = true;
    this.pauseStartedAt = Date.now();
    this.recognitionRestartScheduled = false;

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    return true;
  }

  public resumeRecording(): boolean {
    if (!this.isRecording || !this.isPaused) return false;

    this.isPaused = false;
    this.pausedDurationMs += Date.now() - this.pauseStartedAt;
    this.pauseStartedAt = 0;
    this.recognitionRestartScheduled = false;

    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {}
    }

    return true;
  }

  public getElapsedSeconds(): number {
    if (!this.recordingStartTimestamp) return 0;
    const now = this.isPaused && this.pauseStartedAt ? this.pauseStartedAt : Date.now();
    const activeMs = now - this.recordingStartTimestamp - this.pausedDurationMs;
    return Math.max(0, Math.round(activeMs / 1000));
  }

  private monitorAudioLevel() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.isRecording || this.isPaused || !this.analyser) return;
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

  private async blobToDataUrl(blob: Blob): Promise<string> {
    if (!blob || blob.size === 0) return '';

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to serialize recorded audio'));
      reader.readAsDataURL(blob);
    });
  }

  private async preprocessAudioForTranscription(blob: Blob): Promise<Blob> {
    if (!blob || blob.size === 0) return blob;

    try {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtor) return blob;

      const audioContext = new AudioCtor();
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));

        const trimmed = this.trimSilence(decoded);
        const normalized = this.normalizeAudioBuffer(trimmed);
        return this.audioBufferToWav(normalized);
      } finally {
        await audioContext.close();
      }
    } catch (e) {
      console.warn('Audio preprocessing failed, keeping original recording:', e);
      return blob;
    }
  }

  private trimSilence(audioBuffer: AudioBuffer): AudioBuffer {
    const { numberOfChannels, length, sampleRate } = audioBuffer;
    const channelData = Array.from({ length: numberOfChannels }, (_, index) => audioBuffer.getChannelData(index));
    const silenceThreshold = 0.01;
    const marginSamples = Math.max(1, Math.floor(sampleRate * 0.12));

    let startIndex = length;
    let endIndex = 0;

    for (let i = 0; i < length; i += 1) {
      const samplePeak = channelData.reduce((peak, data) => Math.max(peak, Math.abs(data[i])), 0);
      if (samplePeak > silenceThreshold) {
        startIndex = Math.min(startIndex, i);
        endIndex = Math.max(endIndex, i);
      }
    }

    if (endIndex === 0 || startIndex === length) {
      return audioBuffer;
    }

    const effectiveStart = Math.max(0, startIndex - marginSamples);
    const effectiveEnd = Math.min(length, endIndex + marginSamples);
    const trimmedLength = Math.max(1, effectiveEnd - effectiveStart);

    const trimmedBuffer = new AudioBuffer({
      length: trimmedLength,
      numberOfChannels,
      sampleRate
    });

    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const source = channelData[channel].subarray(effectiveStart, effectiveEnd);
      trimmedBuffer.copyToChannel(source, channel, 0);
    }

    return trimmedBuffer;
  }

  private normalizeAudioBuffer(audioBuffer: AudioBuffer): AudioBuffer {
    const { numberOfChannels, length, sampleRate } = audioBuffer;
    let peak = 0;

    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        peak = Math.max(peak, Math.abs(channelData[i]));
      }
    }

    if (peak === 0 || peak >= 0.9) {
      return audioBuffer;
    }

    const gain = 0.9 / peak;
    const normalizedBuffer = new AudioBuffer({
      length,
      numberOfChannels,
      sampleRate
    });

    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const source = audioBuffer.getChannelData(channel);
      const target = normalizedBuffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        target[i] = source[i] * gain;
      }
    }

    return normalizedBuffer;
  }

  private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    const dataLength = audioBuffer.length * blockAlign;
    const arrayBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, text: string) => {
      for (let i = 0; i < text.length; i += 1) {
        view.setUint8(offset + i, text.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i += 1) {
      for (let channel = 0; channel < numberOfChannels; channel += 1) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const clamped = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  public stopRecording(): Promise<{ audioUrl: string; transcript: string; duration: number }> {
    return new Promise(async (resolve) => {
      if (this.isPaused && this.pauseStartedAt) {
        this.pausedDurationMs += Date.now() - this.pauseStartedAt;
        this.pauseStartedAt = 0;
      }

      this.isRecording = false;
      this.isPaused = false;
      this.recognitionRestartScheduled = false;

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
      }

      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }

      const duration = this.getElapsedSeconds();
      const finalize = async () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm'
        });
        const cleanedAudioBlob = await this.preprocessAudioForTranscription(audioBlob);
        const audioUrl = cleanedAudioBlob.size > 0 ? await this.blobToDataUrl(cleanedAudioBlob) : '';

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

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = finalize;
        this.mediaRecorder.stop();
      } else {
        await finalize();
      }
    });
  }
}
