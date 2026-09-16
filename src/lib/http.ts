import { NextResponse } from "next/server";
import type { ErrorCode } from "@/lib/error-codes";
import { ERROR_CODES } from "@/lib/error-codes";
import { ApiError } from "@/lib/errors";

export interface SuccessResponse<T> {
    success: true;
    data: T;
}

export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export function ok<T>(data: T, init?: ResponseInit) {
    const body: SuccessResponse<T> = { success: true, data };
    return NextResponse.json(body, init);
}

export function fail(code: ErrorCode | string, message: string, status = 400, details?: unknown) {
    const body: ErrorResponse = {
        success: false,
        error: { code, message, ...(details !== undefined ? { details } : {}) },
    };
    return NextResponse.json(body, { status });
}

/** Convert thrown values into a safe API error response. Never leaks internals. */
export function toResponse(error: unknown, logPrefix = "[api]") {
    if (error instanceof ApiError) {
        if (error.status >= 500) console.error(logPrefix, error);
        return fail(error.code, error.message, error.status, error.details);
    }
    console.error(logPrefix, error);
    return fail(ERROR_CODES.INTERNAL_ERROR, "Something went wrong. Please try again.", 500);
}
