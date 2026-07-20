import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let circuitBreakerFailures = 0;
const MAX_FAILURES = 5;

export function middleware(request: NextRequest) {
  // Supavisor DB Connection Proxy Circuit Breaker
  if (circuitBreakerFailures >= MAX_FAILURES) {
    return NextResponse.json({ error: "Supavisor Pool Saturated. Circuit Open." }, { status: 503 });
  }
  // Hard statement timeout enforced externally (2000ms)
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
