export class SpeechService {
  private static instance: SpeechService;
  private speechSynthesis: SpeechSynthesis;
  private speechUtterance: SpeechSynthesisUtterance;
  private isSpeaking: boolean = false;

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.speechUtterance = new SpeechSynthesisUtterance();

    // Set default voice to English
    this.speechUtterance.lang = "en-US";

    // Set other properties
    this.speechUtterance.rate = 1.0;
    this.speechUtterance.pitch = 1.0;
    this.speechUtterance.volume = 1.0;

    // Set the voice once voices are loaded
    this.speechSynthesis.onvoiceschanged = () => {
      const voices = this.speechSynthesis.getVoices();
      // Try to find a good English voice
      const englishVoice =
        voices.find(
          (voice) =>
            (voice.lang.includes("en") && voice.name.includes("Google")) ||
            voice.name.includes("Female")
        ) || voices[0];

      if (englishVoice) {
        this.speechUtterance.voice = englishVoice;
      }
    };
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.isSpeaking) {
        this.stop();
      }

      this.isSpeaking = true;
      this.speechUtterance.text = text;

      this.speechUtterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      this.speechUtterance.onerror = () => {
        this.isSpeaking = false;
        resolve();
      };

      this.speechSynthesis.speak(this.speechUtterance);
    });
  }

  public stop(): void {
    if (this.isSpeaking) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public isPlatformSupported(): boolean {
    return "speechSynthesis" in window;
  }
}
