# Claude API Integration Architecture for SAYU

> **Status**: Architecture Design (Implementation Ready)
> **Author**: SAYU Development Team
> **Last Updated**: 2026-01-29

---

## 1. Executive Summary

SAYU is an AI-powered art discovery platform that connects users with art through personality-based matching (APT - Art Personality Type). This document outlines the strategic integration of Claude API to enhance our AI capabilities.

### Current AI Stack

| Component | Provider | Purpose |
|-----------|----------|---------|
| Art Counselor | OpenAI GPT-4 Turbo | Therapeutic art conversations |
| Quick Response | Groq Llama 3 | Fast recommendations (free tier) |
| Image Generation | Replicate SDXL | Personal art profile images |
| Vector Search | pgvector | Emotion-based artwork matching |

### Proposed Claude Integration

| Component | Model | Purpose | Priority |
|-----------|-------|---------|----------|
| Artwork Analysis | Claude Opus 4 Vision | APT inference from artwork images | High |
| Enhanced Counseling | Claude Opus 4 | Deeper therapeutic conversations | Medium |
| Exhibition Curation | Claude Sonnet 4 | Context-rich exhibition matching | Medium |
| Batch Processing | Claude Batch API | Cost-efficient bulk analysis | Low |

---

## 2. Why Claude for SAYU?

### 2.1 Vision Capabilities

Claude's vision API enables **artwork image analysis** - a game-changer for SAYU:

```
Current Flow:
User uploads artwork → Manual tagging → APT assignment

Proposed Flow:
User uploads artwork → Claude Vision analysis → Auto APT inference
```

**Benefits**:
- Automated artwork categorization
- Consistent APT classification across 5M+ artworks
- Rich artwork descriptions for Art Counselor context

### 2.2 Extended Context Window

Claude's 200K token context enables **holistic exhibition understanding**:

```
Current: Single exhibition analysis (limited context)
Proposed: Full exhibition catalog + artist backgrounds + user history
```

### 2.3 Nuanced Emotional Understanding

For Art Counselor, Claude's empathetic response generation aligns with SAYU's core value:

> "SAYU는 단순한 예술 추천 플랫폼이 아닌, 사용자의 내면과 예술을 연결하는 관계 중심 플랫폼입니다."

---

## 3. Integration Architecture

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SAYU Frontend (Vercel)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Art         │  │ Exhibition  │  │ Artwork Upload      │  │
│  │ Counselor   │  │ Browser     │  │ & Analysis          │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway (Next.js API Routes)             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AI Provider Router                      │    │
│  │  ┌───────────┬───────────┬───────────┬───────────┐  │    │
│  │  │  Claude   │  OpenAI   │   Groq    │ Replicate │  │    │
│  │  │  Opus 4   │  GPT-4    │  Llama 3  │   SDXL    │  │    │
│  │  └─────┬─────┴─────┬─────┴─────┬─────┴─────┬─────┘  │    │
│  └────────┼───────────┼───────────┼───────────┼────────┘    │
└───────────┼───────────┼───────────┼───────────┼─────────────┘
            │           │           │           │
            ▼           ▼           ▼           ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
     │ Artwork  │ │ Deep     │ │ Fast     │ │ Image    │
     │ Vision   │ │ Counsel  │ │ Response │ │ Generate │
     │ Analysis │ │ -ing     │ │          │ │          │
     └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### 3.2 Provider Selection Logic

```typescript
// lib/ai-router.ts
interface AIProviderConfig {
  provider: 'claude' | 'openai' | 'groq' | 'replicate';
  model: string;
  useCase: string;
  costPer1kTokens: number;
  avgLatency: string;
}

const AI_ROUTING: Record<string, AIProviderConfig> = {
  // High-stakes, quality-critical
  'artwork-analysis': {
    provider: 'claude',
    model: 'claude-opus-4-5-20251101',
    useCase: 'Vision-based artwork APT analysis',
    costPer1kTokens: 0.015,
    avgLatency: '2-3s'
  },

  // Emotional depth required
  'art-counselor-deep': {
    provider: 'claude',
    model: 'claude-opus-4-5-20251101',
    useCase: 'Therapeutic art conversations',
    costPer1kTokens: 0.015,
    avgLatency: '2-3s'
  },

  // Quick interactions
  'art-counselor-quick': {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    useCase: 'Fast follow-up responses',
    costPer1kTokens: 0, // Free tier
    avgLatency: '0.5s'
  },

  // Exhibition context analysis
  'exhibition-curation': {
    provider: 'claude',
    model: 'claude-sonnet-4-20250514',
    useCase: 'Exhibition matching with full context',
    costPer1kTokens: 0.003,
    avgLatency: '1s'
  },

  // Batch processing
  'bulk-artwork-tagging': {
    provider: 'claude',
    model: 'claude-sonnet-4-20250514',
    useCase: 'Batch API for cost efficiency',
    costPer1kTokens: 0.0015, // 50% discount
    avgLatency: '24h'
  }
};
```

---

## 4. Claude Vision Integration

### 4.1 Artwork APT Analysis

**Endpoint**: `POST /api/artwork/analyze-vision`

```typescript
// app/api/artwork/analyze-vision/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const APT_ANALYSIS_PROMPT = `
You are an art analysis expert for SAYU, an art personality matching platform.

Analyze this artwork and determine its APT (Art Personality Type) characteristics:

## APT Axes:
- **L/S**: Lyrical (emotional, flowing) vs Structural (geometric, ordered)
- **A/R**: Abstract (non-representational) vs Realistic (representational)
- **E/M**: Emotional (feeling-driven) vs Mental (concept-driven)
- **F/C**: Free (experimental, unconventional) vs Conventional (traditional)

## Output Format (JSON):
{
  "apt_scores": {
    "L": 0.0-1.0, "S": 0.0-1.0,
    "A": 0.0-1.0, "R": 0.0-1.0,
    "E": 0.0-1.0, "M": 0.0-1.0,
    "F": 0.0-1.0, "C": 0.0-1.0
  },
  "primary_type": "LAEF" | "SRMC" | etc.,
  "visual_elements": {
    "colors": ["dominant colors"],
    "composition": "description",
    "technique": "brushwork, texture, etc.",
    "mood": "emotional impression"
  },
  "art_historical_context": "period, movement, influences",
  "recommended_for": ["APT types that would resonate"]
}
`;

export async function POST(request: Request) {
  const { imageUrl, imageBase64 } = await request.json();

  const content = imageUrl
    ? [
        { type: 'image', source: { type: 'url', url: imageUrl } },
        { type: 'text', text: APT_ANALYSIS_PROMPT }
      ]
    : [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: APT_ANALYSIS_PROMPT }
      ];

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 1024,
    messages: [{ role: 'user', content }]
  });

  const analysis = JSON.parse(response.content[0].text);

  return Response.json({
    success: true,
    analysis,
    usage: response.usage
  });
}
```

### 4.2 Batch Processing for Museum Collections

For processing large artwork collections (MetMuseum 5M+ items):

```typescript
// scripts/batch-artwork-analysis.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

async function batchAnalyzeArtworks(artworks: Artwork[]) {
  const requests = artworks.map((artwork, index) => ({
    custom_id: `artwork-${artwork.id}`,
    params: {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: artwork.imageUrl } },
          { type: 'text', text: APT_ANALYSIS_PROMPT }
        ]
      }]
    }
  }));

  // Create batch (50% cost savings, 24h processing)
  const batch = await anthropic.messages.batches.create({
    requests
  });

  return batch.id;
}
```

---

## 5. Enhanced Art Counselor

### 5.1 Claude for Deep Therapeutic Conversations

```typescript
// services/artCounselorClaude.ts
const COUNSELOR_SYSTEM_PROMPT = `
You are SAYU's Art Counselor - a warm, empathetic guide who helps users
explore their emotions through art appreciation.

## User Profile:
- APT Type: {{apt_type}}
- Current Emotion: {{emotion_state}}
- Session History: {{session_count}} sessions

## Your Approach:
1. Meet the user where they are emotionally
2. Use the artwork as a gentle mirror for self-reflection
3. Ask open-ended questions that invite deeper exploration
4. Validate feelings without judgment
5. Connect artistic elements to emotional experiences

## Safety Guidelines:
- If user expresses crisis thoughts, provide crisis resources
- Maintain therapeutic boundaries
- Focus on art-mediated exploration, not direct therapy

## Response Style:
- Warm but not saccharine
- Curious and exploratory
- Culturally sensitive (Korean/global art contexts)
- Use the user's language (Korean/English)
`;

export async function generateCounselorResponse(
  userMessage: string,
  context: CounselorContext
): Promise<CounselorResponse> {
  const systemPrompt = COUNSELOR_SYSTEM_PROMPT
    .replace('{{apt_type}}', context.userAPT)
    .replace('{{emotion_state}}', context.currentEmotion)
    .replace('{{session_count}}', context.sessionCount.toString());

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...context.conversationHistory,
      { role: 'user', content: userMessage }
    ]
  });

  return {
    message: response.content[0].text,
    emotionDetected: detectEmotion(response.content[0].text),
    suggestedArtwork: extractArtworkSuggestion(response.content[0].text)
  };
}
```

### 5.2 A/B Testing: Claude vs OpenAI

```typescript
// middleware/counselor-ab-test.ts
const AB_TEST_CONFIG = {
  testId: 'counselor-claude-vs-openai-2026q1',
  variants: {
    control: { provider: 'openai', weight: 0.5 },
    treatment: { provider: 'claude', weight: 0.5 }
  },
  metrics: ['satisfaction_score', 'session_duration', 'return_rate']
};

export function assignVariant(userId: string): 'control' | 'treatment' {
  const hash = hashUserId(userId);
  return hash % 100 < 50 ? 'control' : 'treatment';
}
```

---

## 6. Extended Context for Exhibition Curation

### 6.1 Full Exhibition Context Analysis

Claude's 200K token context enables comprehensive exhibition matching:

```typescript
// services/exhibitionCurator.ts
async function curateExhibitionForUser(
  userId: string,
  exhibitionId: string
): Promise<CurationResult> {
  // Gather comprehensive context
  const [exhibition, user, userHistory, relatedArtists] = await Promise.all([
    getExhibitionWithFullCatalog(exhibitionId),  // ~50K tokens
    getUserProfile(userId),                       // ~5K tokens
    getUserArtHistory(userId, limit: 100),        // ~20K tokens
    getRelatedArtistProfiles(exhibition.artists)  // ~30K tokens
  ]);

  const prompt = `
## Exhibition: ${exhibition.title}
${exhibition.fullDescription}

### Artworks in Exhibition:
${exhibition.artworks.map(a => `- ${a.title}: ${a.description}`).join('\n')}

### Artists:
${relatedArtists.map(a => `- ${a.name}: ${a.bio}`).join('\n')}

## User Profile:
- APT Type: ${user.aptType}
- Preferred Artists: ${user.favoriteArtists}
- Recent Interactions: ${userHistory.summary}

## Task:
Create a personalized exhibition guide that:
1. Highlights artworks matching user's APT
2. Suggests a viewing order based on emotional arc
3. Provides conversation starters for each recommended piece
4. Connects to user's past art experiences
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseExhibitionGuide(response.content[0].text);
}
```

---

## 7. Cost Analysis

### 7.1 Projected Monthly Costs

| Use Case | Volume/Month | Model | Cost/Request | Monthly Cost |
|----------|--------------|-------|--------------|--------------|
| Artwork Vision | 10,000 | Opus 4 | $0.02 | $200 |
| Deep Counseling | 5,000 | Opus 4 | $0.05 | $250 |
| Quick Responses | 50,000 | Groq | $0 | $0 |
| Exhibition Curation | 20,000 | Sonnet 4 | $0.01 | $200 |
| Batch Processing | 100,000 | Sonnet Batch | $0.005 | $500 |
| **Total** | | | | **$1,150** |

### 7.2 Cost Optimization Strategies

1. **Intelligent Routing**: Use Groq for simple queries, Claude for complex ones
2. **Caching**: Store artwork analyses (artworks don't change)
3. **Batch API**: 50% cost reduction for non-urgent processing
4. **Prompt Optimization**: Minimize token usage while maintaining quality

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Claude SDK in frontend/backend
- [ ] Implement API key management (Supabase Vault)
- [ ] Create AI router middleware
- [ ] Basic artwork vision endpoint

### Phase 2: Vision Integration (Week 3-4)
- [ ] Artwork APT analysis endpoint
- [ ] Integration with artwork upload flow
- [ ] Batch processing for existing artworks
- [ ] Quality validation and tuning

### Phase 3: Counselor Enhancement (Week 5-6)
- [ ] Claude counselor implementation
- [ ] A/B testing framework
- [ ] Metrics collection
- [ ] Gradual rollout (10% → 50% → 100%)

### Phase 4: Exhibition Curation (Week 7-8)
- [ ] Extended context exhibition analysis
- [ ] Personalized guide generation
- [ ] Integration with exhibition pages
- [ ] User feedback collection

---

## 9. Security Considerations

### 9.1 API Key Management

```typescript
// Use Supabase Vault for secure key storage
const { data: apiKey } = await supabase
  .from('vault.secrets')
  .select('secret')
  .eq('name', 'ANTHROPIC_API_KEY')
  .single();
```

### 9.2 Content Safety

Maintain existing safety middleware:
- Pre-flight content filtering
- Response safety validation
- Crisis detection and resource provision

### 9.3 Rate Limiting

```typescript
const CLAUDE_RATE_LIMITS = {
  'artwork-analysis': { requests: 100, window: '1m' },
  'art-counselor': { requests: 15, window: '1m' },
  'exhibition-curation': { requests: 50, window: '1m' }
};
```

---

## 10. Success Metrics

| Metric | Current (OpenAI) | Target (Claude) | Measurement |
|--------|------------------|-----------------|-------------|
| Counseling Satisfaction | 4.2/5 | 4.5/5 | Post-session survey |
| Artwork APT Accuracy | Manual only | 85%+ | Expert validation |
| Exhibition Match Rate | 60% | 75% | User feedback |
| Response Latency | 2.5s | 2.0s | P95 latency |
| Cost per Session | $0.08 | $0.06 | Monthly tracking |

---

## 11. Conclusion

Claude integration will enhance SAYU in three key areas:

1. **Vision**: Automated artwork analysis at scale
2. **Depth**: More empathetic therapeutic conversations
3. **Context**: Comprehensive exhibition understanding

The phased approach allows for careful validation while maintaining service stability.

---

*"예술과 나를 연결하다" - SAYU with Claude*
