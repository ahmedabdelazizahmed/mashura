// Fallback content shown while the database is loading or unreachable.
// The live values come from Supabase (experts, consultation_types, duration_options);
// keep this in step with supabase/seed.sql.

import type { Expert, ConsultationType } from '@/types/data'

export const expert: Expert = {
  name: 'مستشار الأعمال',
  title: 'مستشار أعمال',
  years: 0,
  sessions: 0,
  rating: 0,
  bio: 'جلسات استشارية مباشرة لأصحاب المشاريع والمهنيين: نحلّل موقفك، نرتّب أولوياتك، وتخرج بخطوات واضحة تبدأ بيها فورًا. اختار الطريقة اللي تناسبك: فيديو أو صوت أو مقابلة وجهًا لوجه.',
}

// Three fixed consultation types. Admin has full CRUD over types, methods (video/audio),
// durations (from 15 min), prices, and available times. "مقابلة" is the premium tier.
export const types: ConsultationType[] = [
  {
    id: 'regular', title: 'استشارة عادية', category: 'استشارة', minutes: 30, price: 400,
    blurb: 'جلسة تناقش فيها موضوعك بهدوء وتطلع بخطوات واضحة.',
    modes: ['video', 'audio'],
    durations: [
      { minutes: 15, prices: { video: 250, audio: 180 } },
      { minutes: 30, prices: { video: 400, audio: 300 } },
      { minutes: 45, prices: { video: 600, audio: 450 } },
      { minutes: 60, prices: { video: 800, audio: 600 } },
    ],
  },
  {
    id: 'urgent', title: 'استشارة مستعجل', category: 'استشارة', minutes: 30, price: 650,
    blurb: 'محتاج رأي دلوقتي؟ ميعاد أقرب وأولوية في الرد.',
    modes: ['video', 'audio'],
    durations: [
      { minutes: 15, prices: { video: 400, audio: 300 } },
      { minutes: 30, prices: { video: 650, audio: 500 } },
      { minutes: 45, prices: { video: 900, audio: 700 } },
      { minutes: 60, prices: { video: 1150, audio: 900 } },
    ],
  },
  {
    id: 'meeting', title: 'مقابلة', category: 'مقابلة', minutes: 60, price: 1500,
    blurb: 'جلسة موسّعة وجهاً لوجه لمناقشة متعمّقة أو شراكة. المكان يتم تحديده بعد الحجز.',
    modes: ['in-person'],
    durations: [
      { minutes: 30, prices: { 'in-person': 900 } },
      { minutes: 45, prices: { 'in-person': 1200 } },
      { minutes: 60, prices: { 'in-person': 1500 } },
      { minutes: 90, prices: { 'in-person': 2100 } },
    ],
  },
]
