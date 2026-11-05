# RAG শেখার নোট — Turf Management System

নতুন কিছু শিখলে এই file-এ যোগ হবে। শেষ আপডেট: ২০২৬-১১-০৪

> **এই file কীভাবে ব্যবহার করবেন**
> - **অগ্রগতি:** কোনো বিষয় শেষ হলে `[ ]` বদলে `[x]` করুন।
> - **নতুন শেখা:** [শেখার লগ](#১০-শেখার-লগ)-এ তারিখ দিয়ে লিখুন।
> - **নতুন প্রশ্ন:** [খোলা প্রশ্ন](#৯-খোলা-প্রশ্ন)-এ লিখুন।

---

## ১. অগ্রগতি

- [ ] LLM API-র মূল বিষয়
- [ ] Tool calling
- [ ] RAG-এর মূল ধারণা
- [ ] `pgvector`
- [ ] বাংলা ও Banglish
- [ ] Eval
- [ ] Security
- [ ] Production

**Practice**

- [ ] ধাপ ১: Claude-কে প্রশ্ন পাঠিয়ে উত্তর streaming-এ দেখানো
- [ ] ধাপ ২: নকল `check_availability` tool যোগ করা
- [ ] ধাপ ৩: ১০টা FAQ-এর embedding বানিয়ে `pgvector`-এ রাখা
- [ ] ধাপ ৪: বাংলা ও Banglish প্রশ্নে কোন chunk আসে দেখা
- [ ] ধাপ ৫: Chunk দিয়ে উত্তর লেখানো, জানা না থাকলে "জানি না" বলানো
- [ ] ধাপ ৬: ২০টা প্রশ্নের ছোট test লিখে ফল মাপা

---

## ২. RAG কী?

**RAG = Retrieval-Augmented Generation।** আগে প্রাসঙ্গিক তথ্য খুঁজে আনা হয়, তারপর সেই তথ্য দেখে AI উত্তর লেখে।

সহজ উদাহরণ: AI একজন নতুন staff। সে আপনার turf-এর নিয়ম জানে না। প্রশ্ন এলে আগে rule book-এর ঠিক পাতাটা তার হাতে দেওয়া হয়, তারপর সে সেটা দেখে উত্তর দেয়।

**কেন লাগে:** AI আপনার venue-র নিয়ম জানে না। না জানলে সে বানিয়েও বলতে পারে।

### এই project-এ RAG একা যথেষ্ট না

| প্রশ্নের ধরন | উদাহরণ | উত্তর আসবে |
|---|---|---|
| স্থির তথ্য | "জুতার নিয়ম কী?", "refund কীভাবে হয়?" | **RAG** |
| লাইভ তথ্য | "কাল রাত ৮টায় slot খালি?", "দাম কত?" | **Tool** |
| ব্যক্তিগত তথ্য | "আমার booking কবে?" | **Tool**, logged-in customer-এর জন্য |

**মনে রাখার নিয়ম:** যে তথ্য বদলায়, সেটা embed করবেন না। Slot embed করলে পুরোনো তথ্য দেখিয়ে ভুল booking হবে।

---

## ৩. শেখার বিষয়

### ৩.১ LLM API-র মূল বিষয় (২-৩ দিন)

- **Messages:** `system`, `user` ও `assistant` role। API কিছু মনে রাখে না, তাই প্রতিবার পুরো history পাঠাতে হয়।
- **Token ও context:** খরচ token ধরে হয়। বেশি লেখা পাঠালে খরচ বাড়ে।
- **Streaming:** উত্তর টুকরো টুকরো করে পাঠানো, যাতে chat দ্রুত মনে হয়।
- **Prompt লেখা:** ভূমিকা, নিয়ম, আর তথ্য না পেলে কী করবে।
- **Prompt caching:** একই লেখা বারবার পাঠানোর খরচ কমানো। শুরু থেকে মিলতে হয়, তাই যে লেখা বদলায় না সেটা আগে রাখুন, যেটা বদলায় সেটা পরে।

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // key আসে environment থেকে

const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  system: "তুমি Champions Turf-এর সহকারী। তথ্য না জানলে বলো জানো না।",
  messages: [{ role: "user", content: "আপনারা কয়টায় খোলেন?" }],
});
```

### ৩.২ Tool calling (২-৩ দিন) — এই project-এ সবচেয়ে জরুরি

Slot, দাম আর booking সব এই পথে আসবে।

```text
প্রশ্ন → AI বলে "check_availability ডাকো" → আপনার code চালায়
→ ফল AI-কে ফেরত দেয় → AI উত্তর লেখে
```

- **AI নিজে কিছু চালায় না।** সে শুধু চায়, আপনার code চালায়।
- **Tool-এর নাম ও description ভালো হতে হবে।** AI এগুলো পড়েই tool বেছে নেয়।
- **`strict: true`** দিলে input schema মেনে আসে। তবুও আপনার নিয়ম (তারিখ অতীতে কি না, ground আছে কি না) Zod ও service-এ যাচাই করুন।
- **`claude-opus-5-5`-এ forced `tool_choice` (`any` বা `tool`) দিলে 400 আসে।** `auto` রাখুন আর prompt-এ বলুন।

### ৩.৩ RAG-এর মূল ধারণা (৩-৪ দিন)

- **Embedding:** লেখাকে সংখ্যার তালিকায় বদলানো। একই অর্থের লেখা কাছাকাছি থাকে।
- **Similarity search:** কোন লেখা প্রশ্নের অর্থের সবচেয়ে কাছে, তা খোঁজা। Cosine distance-এর শুধু ধারণা থাকলেই চলবে।
- **Chunking:** Document ছোট ভাগে ভাগ করা। FAQ-তে প্রতিটা প্রশ্ন-উত্তর এক chunk, প্রতিটা ground এক chunk।
- **Top-K:** কতগুলো chunk আনবেন। কম হলে উত্তর বাদ পড়ে, বেশি হলে খরচ ও বিভ্রান্তি বাড়ে।
- **Hybrid search:** Vector আর keyword একসঙ্গে। "5x5"-এর মতো শব্দ vector একা নাও ধরতে পারে।
- **RRF:** দুই search-এর ফল মেলানোর নিয়ম। প্রতিটা তালিকার জন্য score = `1 / (60 + rank)`, তারপর যোগ।
- **Citations:** উত্তর কোন document থেকে এলো, তা দেখানো। Claude-এ `document` block-এ `citations: { enabled: true }` দিতে হয়। এটা `output_config.format`-এর সঙ্গে একসঙ্গে চলে না।

### ৩.৪ `pgvector` (১-২ দিন)

Postgres-এর extension, তাই আলাদা database লাগে না।

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- 1024 হবে আপনার embedding model-এর মাপ
ALTER TABLE "KnowledgeChunk" ADD COLUMN embedding vector(1024);

-- সবচেয়ে কাছের ৫টা chunk (<=> মানে cosine distance)
SELECT id, content FROM "KnowledgeChunk"
ORDER BY embedding <=> $1
LIMIT 5;
```

- **Prisma:** `Unsupported("vector(1024)")` দিয়ে column লিখতে হয়, আর search-এ `$queryRaw`। Parameter দিয়ে লিখবেন, যাতে SQL injection না হয়।
- **`CLAUDE.md`-এর সঙ্গে সংঘাত:** সেখানে raw SQL নিষেধ। এই একটা জায়গায় ব্যতিক্রম লাগবে।
- **Index:** HNSW দ্রুত খোঁজে। অল্প data-তে index ছাড়াও চলতে পারে।
- **Model বদলালে:** সব embedding আবার বানাতে হয়। আলাদা model-এর vector মেলানো যায় না।
- **Local Docker:** এখনকার `postgres:17-alpine`-এ `pgvector` নেই (যাচাই করা)। `pgvector/pgvector:pg17`-এর মতো image লাগবে।
- **Neon (production):** `pgvector` থাকার কথা, কিন্তু এখনো যাচাই করা হয়নি।

### ৩.৫ বাংলা ও Banglish (১-২ দিন)

এখানে সাধারণ tutorial তেমন সাহায্য করবে না, নিজে পরীক্ষা করতে হবে।

- **Embedding-এর মান:** "কাল রাতে খালি আছে?" আর "kal rate khali ache?" একই উত্তর আনে কি না।
- **Model বাছাই:** একটা [BRAC University thesis](https://dspace.bracu.ac.bd/bitstreams/aef74f93-ebd2-4880-8b64-dc180bbad433/download)-এ বাংলা FAQ খোঁজায় `multilingual-e5-large` সবচেয়ে ভালো করেছে, `BGE-M3` খুব কাছাকাছি। এটা একটাই গবেষণা, তাই নিজের প্রশ্ন দিয়ে তুলনা করতে হবে।
- **Keyword search:** Postgres-এ বাংলা stemmer নেই বলে জানি। `simple` config আর `pg_trgm` দিয়ে শুরু করে পরীক্ষা করতে হবে।
- **তারিখ ও সময়:** "কাল", "আগামী শুক্রবার" কে `Asia/Dhaka` অনুযায়ী আসল তারিখে আনা। Weekend এই project-এ শুক্র-শনি।

### ৩.৬ Eval (২ দিন) — বেশিরভাগ developer এটা বাদ দেন

- **Test set:** আসল প্রশ্ন আর সঠিক উত্তরের তালিকা।
- **আলাদা মাপা:** Retrieval ঠিক ছিল, নাকি উত্তর লেখায় ভুল? দুটোর সমাধান আলাদা।
- **তুলনা:** Prompt বা model বদলানোর আগে ও পরে একই test চালানো।

| মাপকাঠি | প্রস্তাবিত লক্ষ্য |
|---|---|
| ঠিক chunk পাওয়া (প্রথম ৫-এর মধ্যে) | ৯০%+ |
| ঠিক tool বেছে নেওয়া | ৯৫%+ |
| দাম ও slot-এ ভুল তথ্য | ০ |
| অন্যের data দেখানো | ০ |
| জানা না থাকলে "জানি না" বলা | ৯০%+ |

এই সংখ্যাগুলো শুরুর প্রস্তাব, কোনো গবেষণার মান না।

### ৩.৭ Security (১-২ দিন)

- **Customer ID:** কখনো AI থেকে নেবেন না, শুধু login session থেকে।
- **Permission থাকবে code-এ, prompt-এ না।** "অন্যের data দেখাবে না" লিখে দিলেই নিরাপদ হয় না।
- **Text-to-SQL নয়:** AI নিজে SQL লিখবে না, শুধু নির্দিষ্ট tool ডাকবে।
- **প্রথমে শুধু পড়া:** Booking, cancel বা refund AI করবে না।
- **Prompt injection:** Ground description বা customer note-এর লেখাকে data ধরবেন, নির্দেশ না।
- **Log ও খরচ:** Log-এ ফোন, email ও token থাকবে না। Rate limit আর দৈনিক খরচের সীমা থাকবে।
- **Privacy:** Customer-এর তথ্য বাইরের API-তে যায়, তাই privacy policy-তে জানাতে হবে।

### ৩.৮ Production (পরে শিখলেও চলবে)

- SSE streaming, যা NestJS থেকে Next-এর মধ্য দিয়ে যাবে
- Timeout, retry আর rate limit (429) সামলানো
- Token খরচ ও দেরির logging
- `stop_reason` দেখা, বিশেষ করে `refusal` ও `max_tokens`

---

## ৪. এই project-এ RAG কীভাবে বসবে

**Document ঢোকানো:**

```text
Admin save → text পরিষ্কার → chunk → hash মিলানো
→ বদলালে তবেই embedding → pgvector-এ save
```

**প্রশ্নের উত্তর:**

```text
প্রশ্ন → login ও rate limit যাচাই → Claude + tools
  ├─ লাইভ তথ্য → service থেকে
  └─ স্থির তথ্য → hybrid search → সেরা chunk
→ উৎসসহ উত্তর (streaming)
```

**কোড যেখানে যাবে (`turf-api`):**

- `src/assistant/`: chat endpoint ও tool
- `src/knowledge/`: document ও search, ধাপ ৪-এ
- Endpoint: `POST /api/v1/assistant/chat`
- Tool: `search_grounds`, `get_ground`, `check_availability`, `my_bookings`
- Table, ধাপ ৪-এ: `KnowledgeDocument`, `KnowledgeChunk`

**RAG-এর উৎস:** ground-এর description, rules ও amenities, website ও venue settings। FAQ ও policy এখনো নেই, লিখতে হবে।

**আগে যাচাই করতে হবে:**

- Vercel → Render পথে streaming ঠিকমতো যায় কি না
- Render free plan sleep করলে প্রথম উত্তর কত দেরি হয়
- Render free plan-এ নিজের embedding model চালানো বাস্তবসম্মত না, তাই hosted API লাগবে

---

## ৫. Project-এর ধাপ

সময়গুলো আনুমানিক।

- [ ] **ধাপ ০, Research (৩-৫ দিন):** ৫০-১০০টা আসল প্রশ্ন জোগাড়, test set, FAQ ও policy লেখা, embedding model তুলনা
- [ ] **ধাপ ১, লাইভ tool (১ সপ্তাহ):** `src/assistant/` module ও চারটা tool
- [ ] **ধাপ ২, FAQ-সহ MVP (৩-৪ দিন):** FAQ prompt-এ, caching-সহ
- [ ] **ধাপ ৩, Portal chat UI (৩-৪ দিন):** Chat widget ও booking link
- [ ] **ধাপ ৪, আসল RAG, দরকার হলে (১ সপ্তাহ):** Vector search ও knowledge manage page
- [ ] **ধাপ ৫, Admin assistant (পরে):** আগের role check মেনে

**কেন ধাপ ৪ এত পরে:** এখন document খুব কম। FAQ সরাসরি prompt-এ দিলেই হয়তো চলবে। Document বাড়লে তবে vector search করবেন।

---

## ৬. Model ও খরচ

দাম অক্টোবর ২০২৬-এর তালিকা থেকে, ব্যবহারের আগে আবার দেখে নিন।

| Model | Input / Output (প্রতি ১০ লাখ token) | ১,০০০ প্রশ্নে আনুমানিক |
|---|---|---|
| `claude-opus-5-5` | $4 / $20 | প্রায় $18 |
| `claude-sonnet-5-5` | $2 / $10 | প্রায় $9 |
| `claude-haiku-5-5` | $0.10 / $0.50 | প্রায় $0.45 |

- হিসাব ধরে নিয়েছে প্রতি প্রশ্নে ৩,০০০ input ও ৩০০ output token। Thinking ও tool-এর token আলাদা যোগ হবে, আর caching খরচ কমাবে। Embedding-এর খরচ ধরা নেই।
- Claude-এর model তালিকায় কোনো embedding model নেই, তাই আলাদা provider লাগবে।
- কোন model চলবে, তা test set-এ তিনটাই চালিয়ে ঠিক করুন।

---

## ৭. এখন যা শেখার দরকার নেই

- ML-এর গণিত, neural network বা model training
- Fine-tuning, নিজের embedding model বানানো
- LangChain-এর মতো বড় framework: আগে SDK দিয়ে নিজে বানালে ভেতরের কাজটা বুঝবেন
- Pinecone-এর মতো আলাদা vector DB: ছোট data-তে `pgvector`-ই যথেষ্ট

**পরে, test-এ দরকার প্রমাণ হলে:**

- [ ] Re-ranking
- [ ] Query rewriting (Banglish প্রশ্নকে বাংলায় আনা)
- [ ] Conversation memory
- [ ] AI দিয়ে booking করানো (confirmation-সহ)
- [ ] Multi-agent, GraphRAG

---

## ৮. শব্দের অর্থ

| শব্দ | অর্থ |
|---|---|
| RAG | তথ্য খুঁজে এনে সেটা দেখে উত্তর লেখা |
| LLM | Claude-এর মতো ভাষার AI model |
| Token | লেখার ছোট টুকরো, এই হিসাবেই খরচ হয় |
| Embedding | লেখার অর্থকে সংখ্যায় প্রকাশ |
| Vector | সংখ্যার তালিকা, embedding এই রূপেই থাকে |
| Chunk | Document-এর একটা ছোট ভাগ |
| Top-K | সবচেয়ে কাছের K সংখ্যক ফল |
| Hybrid search | Vector ও keyword search একসঙ্গে |
| RRF | দুই search-এর ফল মেলানোর নিয়ম |
| HNSW | Vector দ্রুত খোঁজার index |
| Tool calling | AI-র চাওয়ায় আপনার code চালানো |
| Eval | Test set দিয়ে AI-র মান মাপা |
| Prompt injection | লেখার ভেতরে লুকানো ভুল নির্দেশ |
| Hallucination | AI-র বানিয়ে বলা ভুল তথ্য |

---

## ৯. খোলা প্রশ্ন

- [ ] প্রথমে কে ব্যবহার করবে: customer, নাকি admin? (পরামর্শ: customer portal)
- [ ] কোন LLM model?
- [ ] মাসিক বাজেট কত?
- [ ] `pgvector` search-এর জন্য raw SQL-এর ব্যতিক্রম চলবে?
- [ ] কোন embedding model ও provider?

---

## ১০. শেখার লগ

নতুন কিছু শিখলে সবচেয়ে উপরে যোগ করুন।

### ২০২৬-১১-০৪

- RAG একা যথেষ্ট না: লাইভ তথ্য tool থেকে, স্থির তথ্য RAG থেকে আসবে।
- এখনকার অল্প document-এ শুরুতে vector search নাও লাগতে পারে।
- Local Postgres image-এ `pgvector` নেই।
- শেখার রোডম্যাপ ও project-এর ধাপ ঠিক হলো।

---

## ১১. Sources

- [BRAC University thesis: বাংলা FAQ retrieval](https://dspace.bracu.ac.bd/bitstreams/aef74f93-ebd2-4880-8b64-dc180bbad433/download)
- [Railway: Postgres hybrid search with pgvector](https://railway.com/guides/hybrid-search-postgres-pgvector)
