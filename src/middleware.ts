import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    console.log('🔍 Middleware checking:', pathname);

    // ✅ Bỏ qua middleware cho tài nguyên tĩnh và API auth
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/fonts') ||
        pathname.startsWith('/cdn')
    ) {
        return NextResponse.next();
    }

    // ✅ Tránh vòng lặp redirect khi đã ở trang đăng nhập
    if (pathname === '/login' || pathname === '/register' || pathname === '/login/' || pathname === '/register/') {
        return NextResponse.next();
    }

    // ✅ Kiểm tra token trong cookie
    const accessToken = req.cookies.get('authToken')?.value;
    console.log('🔑 Access Token:', accessToken);

    if (!accessToken) {
        console.log('⚠️ No token found, redirecting to login...');
        return NextResponse.redirect(new URL('/login', req.url));
    }

    console.log('✅ Token found, allowing access.');
    return NextResponse.next(); // ✅ Cho phép truy cập nếu có token
}

export const config = {
    matcher: ['/((?!api|_next|static|fonts|cdn).*)'],
};
