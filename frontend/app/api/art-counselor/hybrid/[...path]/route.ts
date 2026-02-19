import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, context: RouteContext) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json(
      { success: false, message: 'Backend API URL is not configured.' },
      { status: 500 },
    );
  }

  const { path: pathSegments = [] } = await context.params;
  const targetPath = pathSegments.join('/');
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    `/api/art-counselor/hybrid/${targetPath}`,
    BACKEND_BASE_URL,
  );

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (['host', 'content-length'].includes(key.toLowerCase())) return;
    headers[key] = value;
  });

  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.text();

  try {
    const backendResponse = await fetch(targetUrl.toString(), {
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
    console.error('[Proxy] Art Counselor hybrid error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reach Art Counselor backend.' },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
