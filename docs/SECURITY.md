# SAYU Security Documentation

> **Last Updated**: 2026-01-29
> **Security Contact**: [Project Issues](https://github.com/yourusername/sayu/issues)

---

## Overview

SAYU implements defense-in-depth security across all layers. This document outlines security measures, compliance status, and best practices.

---

## Authentication & Authorization

### OAuth 2.0 Implementation

```
Supported Providers:
├── Google OAuth 2.0
├── GitHub OAuth
└── Email/Password (Supabase Auth)

Flow:
User → OAuth Provider → Callback → JWT Generation → Secure Session
```

### JWT Token Management

| Token Type | Expiry | Storage |
|------------|--------|---------|
| Access Token | 1 hour | Memory (Zustand) |
| Refresh Token | 7 days | HttpOnly Cookie |

### Row-Level Security (RLS)

All Supabase tables implement RLS policies:

```sql
-- Example: Users can only access their own data
CREATE POLICY "users_own_data" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Example: Public read, authenticated write
CREATE POLICY "exhibitions_public_read" ON exhibitions
  FOR SELECT USING (true);

CREATE POLICY "exhibitions_auth_write" ON exhibitions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**Protected Tables**:
- `user_profiles` - Personal data
- `quiz_results` - APT test results
- `art_counselor_sessions` - Private conversations
- `emotion_vectors` - Emotional profiles
- `gamification_points` - User achievements

---

## API Security

### Rate Limiting

```javascript
// Endpoint-specific limits
const RATE_LIMITS = {
  '/api/art-counselor/*': { requests: 15, window: '1m' },
  '/api/auth/*': { requests: 10, window: '1m' },
  '/api/exhibitions/*': { requests: 100, window: '1m' },
  '/api/groq/*': { requests: 20, window: '1m' },
  'default': { requests: 60, window: '1m' }
};
```

### CORS Configuration

```javascript
const ALLOWED_ORIGINS = [
  'https://sayu.my',
  'https://sayu-frontend.vercel.app',
  'https://sayu.vercel.app',
  'http://localhost:3000',  // Development only
  'http://localhost:3001'
];
```

### Request Validation

- **Input Sanitization**: All user inputs sanitized
- **SQL Injection**: Parameterized queries only
- **JSON Validation**: Zod schemas for API payloads

---

## OWASP Top 10 Compliance

| # | Vulnerability | Status | Implementation |
|---|---------------|--------|----------------|
| A01 | Broken Access Control | ✅ Mitigated | RLS + JWT verification |
| A02 | Cryptographic Failures | ✅ Mitigated | HTTPS + bcrypt |
| A03 | Injection | ✅ Mitigated | Parameterized queries |
| A04 | Insecure Design | ✅ Addressed | Security reviews |
| A05 | Security Misconfiguration | ✅ Addressed | Helmet.js headers |
| A06 | Vulnerable Components | ✅ Monitored | npm audit in CI |
| A07 | Auth Failures | ✅ Mitigated | OAuth 2.0 + JWT |
| A08 | Data Integrity | ✅ Addressed | Input validation |
| A09 | Logging Failures | ⚠️ Partial | Winston logging |
| A10 | SSRF | ✅ Mitigated | Domain whitelist |

---

## XSS Protection

### HTTP Headers (Helmet.js)

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // For Next.js
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.groq.com"]
    }
  },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' }
}));
```

### Input Sanitization

```javascript
// XSS middleware
app.use(xssProtection());

// Output encoding
const sanitizedContent = DOMPurify.sanitize(userInput);
```

---

## CSRF Protection

```javascript
// CSRF token generation
app.use(csrfProtection({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
}));

// Token verification on state-changing requests
app.post('/api/*', verifyCsrfToken);
```

---

## SSRF Prevention

### Image Proxy Whitelist

```javascript
const ALLOWED_IMAGE_DOMAINS = [
  // Museums
  'images.metmuseum.org',
  'www.moma.org',
  'www.tate.org.uk',

  // Art Databases
  'mdl.artvee.com',
  'upload.wikimedia.org',

  // Cloud Storage
  'res.cloudinary.com',
  'supabase.co',

  // Korean Sources
  'www.artmap.or.kr',
  'image.kyobobook.co.kr'
];

// All external image requests routed through proxy
app.get('/api/image-proxy', (req, res) => {
  const url = new URL(req.query.url);
  if (!ALLOWED_IMAGE_DOMAINS.includes(url.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }
  // Proxy the image
});
```

---

## API Key Management

### Environment Variables

```
Production Keys (Vercel/Railway Secrets):
├── SUPABASE_SERVICE_ROLE_KEY  → Never exposed to client
├── OPENAI_API_KEY             → Server-side only
├── GROQ_API_KEY               → Server-side only
├── REPLICATE_API_TOKEN        → Server-side only
└── JWT_SECRET                 → Server-side only

Public Keys (Client-safe):
├── NEXT_PUBLIC_SUPABASE_URL
└── NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Key Rotation Policy

- **Recommended**: Rotate keys quarterly
- **On Compromise**: Immediate rotation + audit
- **Storage**: Vercel/Railway encrypted secrets

### ⚠️ IMMEDIATE ACTION REQUIRED (2026-01-30)

The following API keys were previously exposed in Git history and **MUST be rotated**:

| Service | Action Required |
|---------|-----------------|
| Cloudinary | Regenerate API Key/Secret at https://cloudinary.com/console |
| Naver API | Regenerate credentials at https://developers.naver.com/ |
| Google Places | Regenerate API key at https://console.cloud.google.com/ |

**Steps taken**:
1. Removed `.env` files from Git tracking
2. Added to `.gitignore`
3. Created `.example` template files

**Note**: Even after removing files from Git, the credentials remain in Git history. Consider using `git filter-branch` or BFG Repo-Cleaner to purge history if this is a public repository.

---

## Data Protection

### Personal Data Handling

| Data Type | Storage | Encryption | Retention |
|-----------|---------|------------|-----------|
| Email | Supabase Auth | At rest | Account lifetime |
| APT Results | Supabase | At rest | Account lifetime |
| Conversations | Supabase | At rest | 90 days |
| Emotion Vectors | Supabase | At rest | Account lifetime |

### Data Deletion

Users can request complete data deletion through profile settings:
1. Anonymize public contributions
2. Delete private data
3. Remove from all backups (30-day delay)

---

## Security Monitoring

### Logging

```javascript
// Request logging (Winston)
logger.info({
  requestId: req.id,
  method: req.method,
  path: req.path,
  userId: req.user?.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  duration: responseTime
});

// Security events
logger.warn({
  event: 'rate_limit_exceeded',
  ip: req.ip,
  endpoint: req.path
});
```

### Alerts

- Rate limit violations
- Authentication failures
- Unusual API patterns
- Error rate spikes

---

## CI/CD Security

### Automated Checks

```yaml
# .github/workflows/security.yml
- name: npm audit
  run: npm audit --audit-level=moderate

- name: CodeQL Analysis
  uses: github/codeql-action/analyze@v3

- name: Secret Scanning
  uses: trufflesecurity/trufflehog@main
```

### Dependency Management

- Weekly `npm audit` reports
- Dependabot alerts enabled
- Critical vulnerabilities: 24h SLA

---

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Data breach, auth bypass | Immediate |
| High | XSS, CSRF exploitation | 4 hours |
| Medium | Rate limit bypass | 24 hours |
| Low | Minor misconfiguration | 1 week |

### Response Process

1. **Detect**: Automated monitoring + user reports
2. **Contain**: Isolate affected systems
3. **Investigate**: Root cause analysis
4. **Remediate**: Deploy fixes
5. **Review**: Post-incident documentation

---

## Security Contacts

- **Security Issues**: Create a private issue or contact directly
- **Vulnerability Reports**: Responsible disclosure appreciated

---

## Compliance Checklist

- [x] OWASP Top 10 addressed
- [x] HTTPS enforced
- [x] Secure authentication (OAuth 2.0)
- [x] Input validation
- [x] Output encoding
- [x] Rate limiting
- [x] Security headers
- [x] Dependency scanning
- [x] Logging and monitoring
- [ ] Penetration testing (planned)
- [ ] SOC 2 compliance (not required for personal project)

---

*Last security review: 2026-01-19*
