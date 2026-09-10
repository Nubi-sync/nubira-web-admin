import type { NextConfig } from "next";
import { EventEmitter } from "events";

// Increase max listeners for dev server streaming/compression to prevent MaxListenersExceededWarning
if (typeof process !== 'undefined') {
  EventEmitter.defaultMaxListeners = 30;
}

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://static.cloudflareinsights.com https://cloudflareinsights.com ws://localhost:* http://localhost:* ws://127.0.0.1:* http://127.0.0.1:*;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  compress: process.env.NODE_ENV === 'production',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        '*.local',
        '*.local:3000',
        'zigza.in',
        '*.zigza.in',
        '*.vercel.app',
      ],
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

