export async function convertAudioToBase64String(
  data: Buffer,
): Promise<string> {
  return data.toString('base64');
}

export function convertBase64StringToBuffer(base64String: string): Buffer {
  return Buffer.from(base64String, 'base64');
}
