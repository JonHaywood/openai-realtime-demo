import Speaker from 'speaker';

const speaker = new Speaker({
  channels: 1, // 1 channels
  bitDepth: 16, // 16-bit samples
  sampleRate: 24000, // 24kHz sample rate
});

export function playAudio(data: Buffer): void {
  speaker.write(data);
}
