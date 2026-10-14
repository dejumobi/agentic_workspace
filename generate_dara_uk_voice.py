#!/usr/bin/env python3
"""Generate SaxWorx Dara coaching MP3s with a consistent British male voice.
Install: python3 -m pip install edge-tts
Run: python3 generate_dara_uk_voice.py --out voices
Requires an internet connection to Microsoft's online speech service.
"""
import argparse
import asyncio
from pathlib import Path
import edge_tts

PROMPTS = {
    'dara-welcome': "Hello! I'm Dara, and I'll be your tutor guide for today. Welcome to SaxWorx. We will take your saxophone journey one step at a time. Practising consistently, even for fifteen minutes a day, helps you improve faster than occasional long sessions.",
    'dara-start': "Let's begin. Select your level, then choose today's lesson. Read the goal and follow each step in order. Start slowly and focus on a clear, steady sound.",
    'dara-listen': "First, select Listen to Sax and hear the complete example. Notice the pitch, rhythm, and phrasing. If you have selected a groove, listen for how the notes fit the beat.",
    'dara-count': "Listen for the count-in. Feel the pulse before you play. One, two, three, four. Keep your breathing relaxed and your fingers close to the keys.",
    'dara-play': "Now it's your turn. Play along with the example, keeping your notes in time with the groove. Don't rush. Accuracy comes before speed.",
    'dara-mic': "To check your notes, allow microphone access and start your practice attempt. The app will listen for pitch and timing. Play one phrase at a time.",
    'dara-retry': "Good effort. If a note or rhythm was difficult, lower the tempo and try that phrase again. Small, focused repetitions build strong technique.",
    'dara-groove': "Choose a groove style, then adjust the drums, bass, and sax guide volumes. Start the rehearsal and feel the beat before joining in. Use Stop to end playback.",
    'dara-next': "Well done. Review your feedback, then move to the next exercise. You can return to an earlier lesson whenever you need more practice.",
    'dara-daily': "For today's practice, begin with a warm-up, work carefully through each exercise, then finish by playing with a groove. Aim for a little progress every day.",
    'dara-finish': "Excellent work today. Remember, consistent practice produces steady improvement. Come back tomorrow, review what you've learned, and keep making music. I'm Dara, and I'll be here to guide you.",
    'dara-instrument': "Before you begin, choose the saxophone you are playing. The app will adjust the demonstration for your selected instrument. Check your fingering and listen carefully to the written notes.",
}

async def main():
    p=argparse.ArgumentParser()
    p.add_argument('--out',default='voices',help='Output folder for MP3 files')
    p.add_argument('--voice',default='en-GB-RyanNeural',help='UK male voice identifier')
    p.add_argument('--rate',default='-5%',help='Speech rate adjustment')
    args=p.parse_args()
    out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    for name,script in PROMPTS.items():
        dest=out/(name+'.mp3')
        await edge_tts.Communicate(script,voice=args.voice,rate=args.rate).save(str(dest))
        print('Created',dest)
    print(f'Completed {len(PROMPTS)} British male voice prompts.')

if __name__=='__main__':
    asyncio.run(main())
