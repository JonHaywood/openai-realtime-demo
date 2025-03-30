import mic from 'mic';

export interface Microphone {
  startRecording: (processAudio: (data: Buffer) => void) => void;
  stopRecording: () => void;
}

export function createMicrophone(): Microphone {
  const micInstance = mic({
    rate: '16000',
    channels: '1',
    debug: true,
    exitOnSilence: 6,
    device: 'default',
  });

  return {
    startRecording: (processAudio: (data: Buffer) => void) => {
      const micInputStream = micInstance.getAudioStream();

      micInputStream.on('data', (data: Buffer) => {
        console.log('🎤 Received input stream: ' + data.length);
        processAudio(data);
      });

      micInputStream.on('error', (err) => {
        console.error('🎤 Error in Input Stream: ' + err);
      });

      micInstance.start();
      console.log('🎤 Microphone started');
    },
    stopRecording: () => {
      micInstance.stop();
      console.log('🎤 Microphone stopped');
    },
  };
}
