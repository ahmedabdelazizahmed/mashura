# Mashura — مشورة · Design System

Mashura is a one-expert consulting marketplace. A visitor browses the consultation
types Ahmed offers, picks a modality (video call or audio call), picks a time,
pays online, and gets a confirmed session. Everything they've ever booked lives in
one place.

> مشورة — احجز استشارة بيزنس ومشاريع في دقيقة. اختار فيديو أو مكالمة صوتية، حدّد الميعاد
> المناسب، وادفع أونلاين. مشورة واضحة من غير لفّ ودوران.

> Mashura — Book a business & projects consultation in minutes. Pick video or audio,
> choose a time that works, and pay online. Clear, expert advice without the
> back-and-forth.

## Products represented here

| Surface | What it is | UI kit |
|---|---|---|
| Marketing site | Public landing + consultation catalogue + expert profile. Converts a visitor into a booking. | `ui_kits/marketing_site/` |
| Booking app | Signed-in flow: choose type → modality → slot → pay → confirmation, plus "my bookings". | `ui_kits/booking_app/` |

## Sources given to me

The **only** source for this system was the product description pasted into chat
(Arabic + English, reproduced above). There was:

- no codebase, repository, or local folder,
- no Figma file or link,
- no slide deck,
- **no logo, brand mark, or font files.**

Everything below — palette, type pairing, spacing, components — is an original
proposal built to fit that description. It is a starting point, not a record of an
existing brand. Where a real asset is missing I say so rather than inventing one.

### Known substitutions (please replace)

1. **No logo.** Wherever a mark belongs, this system sets the wordmark in type:
   `مشورة` in Tajawal 800, optionally with `Mashura` beneath in IBM Plex Sans Arabic.
   No mark has been drawn. Send the real logo and I'll wire it into `assets/`.
2. **No font files.** Substituted the two closest Google Fonts to a modern
   Egyptian-Arabic editorial voice: **Tajawal** (display) and **IBM Plex Sans Arabic**
   (UI/body), with **IBM Plex Mono** for numerals. Swap `tokens/fonts.css` if Mashura
   has licensed faces.
3. **No icon set.** Using **Lucide** from CDN (1.75px stroke, round caps) — the closest
   match to the plain, calm tone of the copy. Flagged; see ICONOGRAPHY.

---

## CONTENT FUNDAMENTALS

**Language.** Arabic-first, Egyptian colloquial (عامية مصرية) — not Modern Standard.
The brief's own voice is the standard: `اختار فيديو أو مكالمة صوتية`, `حدّد الميعاد المناسب`,
`من غير لفّ ودوران`. Never translate that into stiff MSA (`قم باختيار`, `يرجى تحديد`). Every
layout must work in RTL first; the English site is a mirror, not the source.

**Address.** Second person, singular, informal — you speak *to* the visitor:
`تحجز`, `تشوف`, `تختار`, `يناسبك`. Ahmed is referred to in the third person by first name
(`استشارة مع أحمد`), never as "our team" or "we" — there is one expert and the product
is honest about that. Mashura itself almost never says "we".

**Register.** Plain, useful, unhurried. Sentences are short and each one carries one
fact. The promise is stated and then immediately made concrete:
"احجز استشارة في دقيقة" is followed by the three actual steps. No hype adjectives
(ثوري, الأفضل, unmatched), no growth-marketing verbs, no exclamation marks.

**Signature phrase.** `مشورة واضحة من غير لفّ ودوران` — "clear advice, no runaround." It is
the tone check for every string: if a sentence has لفّ ودوران in it, rewrite it.

**Casing (Latin).** Sentence case everywhere — headings, buttons, labels. Only the
wordmark "Mashura" and proper nouns are capitalised. No Title Case, no ALL CAPS
except the 12px overline (`--size-overline`, tracking `.08em`) used for section
eyebrows in Latin only. **Arabic is never letter-spaced and has no case** — Arabic
eyebrows get weight and colour instead of tracking.

**Buttons and CTAs** are verbs in the imperative, 1–3 words:
`احجز مشورة` · `اختار ميعاد` · `ادفع وأكّد` · `Book a session` · `Confirm & pay`.
Never "Submit", "Click here", "Learn more".

**Numbers, money, time.** Prices in Egyptian pounds with the currency after the
number: `٧٥٠ ج.م` / `750 EGP`. Durations in minutes: `٣٠ دقيقة`. Times use 12-hour with
a period word (`٦:٣٠ م`). Set all figures in `--font-mono` with tabular numerals so
prices and slot lists align in a column.

**Empty and error states** name the situation and the next action, no apology
theatre: `مفيش حجوزات لسه — ابدأ بأول مشورة`. Errors are specific:
`الميعاد ده اتحجز خلال ما بتدفع. اختار ميعاد تاني`.

**Emoji: no.** Not in UI, not in marketing copy, not in confirmation emails. The
brand's warmth comes from the palette and the dialect, not from glyphs.

**Vibe.** A trusted, experienced person answering your question directly across a
table. Warm paper, dark green ink, one gold pen. Unfussy, adult, competent.

---

## VISUAL FOUNDATIONS

### Colour

Three families, in `tokens/colors.css`:

- **Pine** (`--pine-800 #113A33` core) — the brand. Primary buttons, footers,
  inverse sections, the wordmark. Reads as expertise and calm, not corporate blue.
- **Saffron** (`--saffron-500 #E8A33D`) — the single accent. Used for *one* thing per
  view: the confirm action, a selected slot, an "available now" pip. It is never a
  background for large areas and never decorative.
- **Sand** (`--sand-100 #F7F2EA` page, white cards) — a warm paper neutral. Text runs
  `--sand-900` → `--sand-700`.

Semantic hues stay muted and desaturated (`--green-600 #2E7D5B`, `--red-600 #B4402F`)
so status never out-shouts saffron. **Video vs audio** gets its own pair
(`--mode-video-*` teal-blue, `--mode-audio-*` saffron) because modality is the core
product choice.

Rules: max two background tones per screen (sand page + white cards), or one inverse
pine band. Never a gradient between two hues. Never purple-blue gradients.

### Type

`Tajawal` for display and headings (700/800), `IBM Plex Sans Arabic` for everything
else (400/500/600), `IBM Plex Mono` for numerals only. Scale is a ~1.27 ratio:
56 / 44 / 34 / 27 / 22 / 18 / 16 / 14 / 13 / 12.

Arabic needs vertical air: body line-height is **1.75**, headings 1.3, display 1.15.
Measure caps at `--width-prose: 64ch`. Headings are tight-tracked by the face itself —
do not add letter-spacing to Arabic, ever.

### Spacing & layout

A 4px base with a hand-tuned scale (2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96).
Content column `1160px`, page gutter 24px mobile / 48px desktop, forms capped at 440px.
Sections breathe: 80–96px vertical rhythm on marketing, 32–40px inside app views.

Full readme content is available in the source project — this is a stub. See the
canonical version in the Claude Design project referenced by the design-system id.
