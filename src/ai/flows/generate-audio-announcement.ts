'use server';
/**
 * @fileOverview An AI agent for generating audio announcements from text.
 *
 * - generateAudioAnnouncement - A function that converts text to speech.
 * - GenerateAudioAnnouncementInput - The input type for the function.
 * - GenerateAudioAnnouncementOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

const GenerateAudioAnnouncementInputSchema = z.object({
  text: z.string().describe("The text to be converted to speech."),
});
export type GenerateAudioAnnouncementInput = z.infer<typeof GenerateAudioAnnouncementInputSchema>;

const GenerateAudioAnnouncementOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a base64-encoded WAV data URI."),
});
export type GenerateAudioAnnouncementOutput = z.infer<typeof GenerateAudioAnnouncementOutputSchema>;

export async function generateAudioAnnouncement(input: GenerateAudioAnnouncementInput): Promise<GenerateAudioAnnouncementOutput> {
  return generateAudioAnnouncementFlow(input);
}

async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        let bufs = [] as any[];
        writer.on('error', reject);
        writer.on('data', function (d) {
            bufs.push(d);
        });
        writer.on('end', function () {
            resolve(Buffer.concat(bufs).toString('base64'));
        });

        writer.write(pcmData);
        writer.end();
    });
}

const generateAudioAnnouncementFlow = ai.defineFlow(
  {
    name: 'generateAudioAnnouncementFlow',
    inputSchema: GenerateAudioAnnouncementInputSchema,
    outputSchema: GenerateAudioAnnouncementOutputSchema,
  },
  async ({ text }) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No audio was generated.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
