# The assistant (booking + RAG)

The widget has two jobs, and they are deliberately separate.

## 1. Booking from a sentence

`assistantNlu.ts` (pure parser) → `assistantEngine.ts` (pure conversation logic) → `Assistant.tsx` (UI).

- Understands Egyptian-Arabic dates, times and durations ("بكرة الساعة 5 العصر", "يوم الخميس 11 الصبح", "نص ساعة").
- Reads real availability, proposes alternatives when a time is taken, shows the type, duration, time and price.
- **Never books by itself.** `create_booking` is called only after the user answers yes, and it re-validates everything on the server.

## 2. Answering questions: retrieval-augmented generation (RAG)

Questions such as "how do I pay?", "can I get a refund?" or "I forgot my password" are answered from a **knowledge base** instead of guesses.

```
question ──► kb_search (SQL)  ──► top articles with a 0..1 score
                                        │
              score ≥ 0.5 ──► optional model phrases an answer ONLY from those articles
                                        │ (falls back to the article text if the model is off or fails)
              0.3 – 0.5  ──► "maybe you meant:" + the article
              < 0.3      ──► normal fallback ("I didn't understand…")
```

**Where things are**

| Piece | File |
|---|---|
| Table `kb_articles`, Arabic normalisation (`kb_norm`), light stemmer (`kb_stem`), search function `kb_search` | `supabase/migrations/0003_payments_and_knowledge.sql` |
| Starter articles (27 Q&A in Egyptian Arabic) | `supabase/seed_kb.sql` |
| Routing of messages to the knowledge base | `src/lib/assistantEngine.ts` (`wantsKnowledge`, `answerFromKb`) |
| Wiring (`kb`, `kbAnswer`) | `src/components/Assistant.tsx` |
| Optional "generate" step | `supabase/functions/assistant-answer/index.ts` |
| Editing articles and trying questions | Admin → *أسئلة المساعد* (`src/pages/admin/Knowledge.tsx`) |

**How retrieval works.** No extension is needed. Text is normalised (diacritics, alef/ya/ta-marbuta variants, Arabic digits) and each word is reduced by a small stemmer. Every meaningful word of the question scores 1 if its stem is in the article's question or keywords, 0.35 if only in the answer; the sum is divided by the number of words. Filler words (ازاي، عايز، هل…) are ignored. The stemmer is crude on purpose: it only has to map the same word to the same stem on both sides.

**Why not embeddings?** For a few dozen articles, a transparent keyword search is cheap, predictable, free and easy to debug. If the knowledge base grows to hundreds of articles, add `pgvector` and an embedding step; the rest of the pipeline (route → retrieve → optional generate → fall back) stays the same.

**Safety.** The generation function receives only the question and at most three retrieved passages, is told to answer from them or return `NO_ANSWER`, treats both as data, caps the output length, and cannot touch the database or book anything. The API key lives in Supabase secrets.

**Tests.** `tests/assistant/assistant.test.mjs` runs the real engine against the real SQL: questions are answered from the right article, booking sentences are never hijacked, a question in the middle of a confirmation keeps the pending proposal, and a knowledge-base outage degrades gracefully.
