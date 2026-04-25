import { NextRequest, NextResponse } from "next/server";

export async function proxyRequest(request: NextRequest, params: { path: string[] }, baseUrl: string) {
    const path = params.path.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${baseUrl}/${path}${searchParams ? `?${searchParams}` : ""}`;

    const headers = new Headers(request.headers);
    headers.delete("host");

    const body = request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined;

    try {
        const response = await fetch(url, {
            method: request.method,
            headers,
            body,
            credentials: "include",
        });

        const responseBody = await response.text();
        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete("content-encoding");
        responseHeaders.delete("transfer-encoding");

        return new NextResponse(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error(`Proxy error to ${url}:`, error);
        return NextResponse.json({ message: "Service unavailable" }, { status: 503 });
    }
}
