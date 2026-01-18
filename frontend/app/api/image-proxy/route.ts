import { NextRequest, NextResponse } from 'next/server';

// Allowed image source domains (SSRF protection)
const ALLOWED_DOMAINS = [
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'images.metmuseum.org',
  'openaccess-cdn.clevelandart.org',
  'api.artic.edu',
  'www.artic.edu',
  'res.cloudinary.com',
  'images.unsplash.com',
  'source.unsplash.com',
  'ids.si.edu',
  'media.nga.gov',
  'collections.louvre.fr',
  'www.moma.org',
  'www.tate.org.uk',
  'www.rijksmuseum.nl',
  'd32dm0rphc51dk.cloudfront.net',
  'lh3.googleusercontent.com',
  'k.kakaocdn.net',
  'img.freepik.com',
  'images.pexels.com',
  'cdn.pixabay.com',
];

// Block internal/private IPs
function isBlockedIP(hostname: string): boolean {
  const blocked = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '169.254.169.254', // AWS metadata
    'metadata.google.internal',
  ];

  if (blocked.includes(hostname)) return true;

  // Block private IP ranges
  const ipMatch = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipMatch) {
    const [, a, b] = ipMatch.map(Number);
    if (a === 10) return true; // 10.x.x.x
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16-31.x.x
    if (a === 192 && b === 168) return true; // 192.168.x.x
    if (a === 127) return true; // 127.x.x.x
  }

  return false;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB max

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    const parsedUrl = new URL(decodedUrl);

    // Security: Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return new NextResponse('Only HTTPS URLs allowed', { status: 400 });
    }

    // Security: Block internal IPs
    if (isBlockedIP(parsedUrl.hostname)) {
      return new NextResponse('Invalid URL', { status: 400 });
    }

    // Security: Only allow known image domains
    if (!ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain))) {
      return new NextResponse('Domain not allowed', { status: 403 });
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'SAYU/1.0 Image Proxy',
        'Accept': 'image/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: 502 });
    }

    // Verify content type is image
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Not an image', { status: 400 });
    }

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_SIZE) {
      return new NextResponse('Image too large', { status: 413 });
    }

    const buffer = await response.arrayBuffer();

    // Double-check size after download
    if (buffer.byteLength > MAX_SIZE) {
      return new NextResponse('Image too large', { status: 413 });
    }

    // Return image with proper CORS (restrict to known origins)
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = ['https://www.sayu.my', 'https://sayu.my', 'http://localhost:3000'];
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return new NextResponse('Request timeout', { status: 504 });
    }
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}