import mic from 'mic';

export interface Microphone {
  startRecording: (processAudio: (data: Buffer) => void) => void;
  stopRecording: () => void;
}

export function createMicrophone(): Microphone {
  const micInstance = mic({
    rate: '16000',
    channels: '1',
    debug: false,
    exitOnSilence: 6,
    device: 'default',
  });

  return {
    startRecording: (processAudio: (data: Buffer) => void) => {
      const micInputStream = micInstance.getAudioStream();

      // pass the audio data to the callback function
      micInputStream.on('data', (data: Buffer) => processAudio(data));

      micInputStream.on('error', (err) => {
        console.error('[mic] 🎤 Error in Input Stream: ' + err);
      });

      micInstance.start();
      console.log('[mic] 🎤 Microphone started.');
    },
    stopRecording: () => {
      micInstance.stop();
      console.log('[mic] 🎤 Microphone stopped.');
    },
  };
}
