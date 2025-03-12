import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 🚀 Bỏ qua middleware cho tài nguyên tĩnh và API auth
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/fonts') ||
        pathname.startsWith('/cdn')
    ) {
        return NextResponse.next();
    }

    console.log(pathname)

    // 🔓 Bỏ qua middleware cho trang đăng nhập và đăng ký để tránh vòng lặp redirect
    if (pathname === '/login/' || pathname === '/register/' || pathname == 'login' || pathname == 'register') {
        return NextResponse.next();
    }

    // 🔓 Các trang công khai (không cần login)
    const publicPaths = ['/', '/home/', '/products/', '/about/', '/map/', '/store/'];

    // 📌 Kiểm tra nếu là trang sản phẩm hoặc cửa hàng chi tiết
    const isProductDetail = /^\/products\/[^/]+$/.test(pathname);
    const isStoreDetail = /^\/store\/[^/]+$/.test(pathname);

    if (publicPaths.includes(pathname) || isProductDetail || isStoreDetail) {
        return NextResponse.next(); // Không chặn các trang công khai
    }

    // 🔑 Kiểm tra token trong cookie
    const accessToken = req.cookies.get('authToken')?.value;

    if (!accessToken) {
        // ⛔ Nếu không có token, redirect đến login (chỉ khi không phải đang ở login)
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next(); // ✅ Cho phép truy cập nếu có token
}

export const config = {
    matcher: ['/((?!api|_next|static|fonts|cdn).*)'],
};
