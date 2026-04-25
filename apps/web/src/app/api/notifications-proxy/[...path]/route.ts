import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

const NOTIFICATIONS_BASE_URL = process.env.NOTIFICATIONS_URL || "http://localhost:3002/api";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    return proxyRequest(request, params, NOTIFICATIONS_BASE_URL);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
    return proxyRequest(request, params, NOTIFICATIONS_BASE_URL);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
    return proxyRequest(request, params, NOTIFICATIONS_BASE_URL);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
    return proxyRequest(request, params, NOTIFICATIONS_BASE_URL);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
    return proxyRequest(request, params, NOTIFICATIONS_BASE_URL);
}
