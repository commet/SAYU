import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path: segments = [] } = await context.params;
  if (!segments.length) {
    return NextResponse.json(
      { success: false, message: 'Missing Art Counselor endpoint.' },
      { status: 400 },
    );
  }

  const targetPath = segments.join('/');
  const backendUrl = new URL(`/api/art-counselor/${targetPath}`, BACKEND_BASE_URL);
  const incomingUrl = new URL(request.url);

  incomingUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (['host', 'content-length'].includes(key.toLowerCase())) return;
    headers[key] = value;
  });

  const cookie = request.headers.get('cookie');
  if (cookie) {
    headers['cookie'] = cookie;
  }

  const body = ['GET', 'HEAD'].includes(request.method.toUpperCase())
    ? undefined
    : await request.text();

  try {
    const backendResponse = await fetch(backendUrl.toString(), {
      method: request.method,
      headers,
      body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return;
      responseHeaders.set(key, value);
    });

    const responseBody = await backendResponse.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Proxy] Art Counselor API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reach Art Counselor API.' },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
