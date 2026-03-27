export interface NightContent {
  id: string;
  type: 'meditation' | 'affirmation' | 'reflection' | 'comfort';
  title: string;
  content: string;
  duration?: string;
}

export const nightContent: NightContent[] = [
  {
    id: 'n1',
    type: 'meditation',
    title: 'Body Scan for Restless Nights',
    content: 'Find a comfortable position. Close your eyes and take three deep breaths.\n\nBring your attention to the top of your head. Notice any tension there, and gently release it.\n\nMove your attention slowly down to your forehead... your eyes... your jaw. Let each area soften.\n\nContinue this gentle scan through your neck... shoulders... arms... hands.\n\nNotice your chest rising and falling with each breath. Let your belly be soft.\n\nMove down through your hips... legs... feet.\n\nWith each exhale, imagine releasing a little more weight into the surface beneath you.\n\nYou are safe. You are held. You can rest now.\n\nContinue breathing gently. There is nowhere to be but here.',
    duration: '10 min',
  },
  {
    id: 'n2',
    type: 'affirmation',
    title: 'Gentle Night Affirmations',
    content: 'Read these slowly, letting each one settle:\n\n• I did enough today.\n\n• My grief is a testament to my love.\n\n• I am allowed to rest, even when my mind is restless.\n\n• Tomorrow is a new day, and I will face it when it comes.\n\n• The people I love are still part of me.\n\n• I don\'t need to have it all figured out tonight.\n\n• My feelings are valid, even the messy ones.\n\n• I am worthy of peace and comfort.\n\n• It\'s okay to miss them and still find moments of joy.\n\n• I am not alone in this, even when it feels that way.',
  },
  {
    id: 'n3',
    type: 'reflection',
    title: 'A Letter to the Night',
    content: 'Nighttime can be the hardest. The world goes quiet and all the feelings you held at bay during the day come rushing in.\n\nThis is normal. This is grief doing its work.\n\nThe night is not your enemy. Think of it as a quiet space where you can finally feel without performing strength for anyone.\n\nIf tears come, let them. They are not weakness — they are love with nowhere to go.\n\nIf sleep won\'t come, don\'t fight it. Be here. Read something gentle. Breathe deeply. Know that millions of others are also awake tonight, carrying their own sorrows.\n\nYou are part of a great, invisible community of tender hearts.\n\nThe dawn will come. It always does.',
  },
  {
    id: 'n4',
    type: 'comfort',
    title: 'Things That Are True at 3am',
    content: '• Your pain is real, and it matters.\n\n• You are not broken. You are grieving.\n\n• Sleep will come eventually. Be patient with yourself.\n\n• The love you carry does not expire.\n\n• It\'s okay to cry. It\'s okay to be angry. It\'s okay to feel nothing at all.\n\n• You survived every hard day before this one.\n\n• Someone, somewhere, is thinking of you with kindness right now.\n\n• Your person would want you to be gentle with yourself tonight.\n\n• This feeling, however intense, is temporary. You will not feel this way forever.\n\n• You are allowed to take up space with your grief.',
  },
  {
    id: 'n5',
    type: 'meditation',
    title: 'The Safe Place Visualization',
    content: 'Close your eyes. Take a slow, deep breath in... and out.\n\nImagine a place where you feel completely safe. It might be a childhood memory, a favorite room, a beach, a forest.\n\nSee it clearly. What colors surround you? What do you hear?\n\nImagine the temperature is perfect. The light is soft and golden.\n\nIn this place, there is no rush. No expectations. No grief to manage.\n\nYou can simply be.\n\nIf your loved one appears in this place, welcome them. Sit with them quietly.\n\nThere\'s nothing you need to say. Just being together is enough.\n\nStay here as long as you need. This place is always available to you.\n\nWhen you\'re ready, take three gentle breaths and slowly return.',
    duration: '15 min',
  },
  {
    id: 'n6',
    type: 'affirmation',
    title: 'Permission Slips for Grievers',
    content: 'Tonight, you have permission to:\n\n• Feel whatever you\'re feeling without judgment.\n\n• Not be okay.\n\n• Miss them with your whole heart.\n\n• Eat comfort food or skip dinner entirely.\n\n• Watch something lighthearted without guilt.\n\n• Cry over something that seems small.\n\n• Reach out to someone, even if it\'s late.\n\n• Stay in bed a little longer.\n\n• Talk to your person, even though they can\'t answer.\n\n• Hope for better days while honoring the hard ones.\n\n• Simply survive today. That is more than enough.',
  },
  {
    id: 'n7',
    type: 'reflection',
    title: 'The Waves of Grief',
    content: 'Grief comes in waves. You\'ve probably heard this before, but at night, the waves feel bigger.\n\nDuring the day, you have distractions — work, errands, conversations. But at night, it\'s just you and the ocean.\n\nHere\'s what to remember about waves:\n\nThey come whether you want them to or not. Fighting them only exhausts you.\n\nThey peak and then they recede. No wave lasts forever.\n\nOver time, the waves come less frequently. But when they do come, they can still be powerful.\n\nYou are learning to swim. Some nights you float. Some nights you tread water. Both are valid.\n\nThe shore is always there. You will reach it again.\n\nRight now, just breathe. One breath at a time. That is enough.',
  },
  {
    id: 'n8',
    type: 'comfort',
    title: 'A Warm Embrace in Words',
    content: 'If you could receive a hug right now from anyone in the world — living or gone — who would it be?\n\nClose your eyes and imagine them here.\n\nFeel their arms around you. The weight of their embrace. The way your body relaxes into theirs.\n\nHear them whisper: "I\'m so proud of you. You\'re doing so well."\n\nLet those words settle into your bones.\n\nNow, wrap your own arms around yourself. Squeeze gently. This is called a butterfly hug, and your nervous system responds to it like a real embrace.\n\nHold yourself the way they would hold you.\n\nYou are loved. You are remembered. And love like that never truly leaves.',
  },
];

export const getTimeBasedContent = (): NightContent[] => {
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 6) {
    return nightContent;
  }
  return nightContent.filter((c) => c.type !== 'meditation').slice(0, 4);
};
