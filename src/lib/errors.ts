import { ERROR_CODES, type ErrorCode } from "@/lib/error-codes";

export class ApiError extends Error {
    readonly code: string;
    readonly status: number;
    readonly details?: unknown;

    constructor(code: ErrorCode | string, message: string, status = 400, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.status = status;
        this.details = details;
    }

    static unauthorized(message = "Authentication required") {
        return new ApiError(ERROR_CODES.UNAUTHORIZED, message, 401);
    }

    static forbidden(message = "You do not have access to this resource") {
        return new ApiError(ERROR_CODES.FORBIDDEN, message, 403);
    }

    static notFound(resource = "Resource") {
        return new ApiError(ERROR_CODES.NOT_FOUND, `${resource} not found`, 404);
    }

    static conflict(message: string) {
        return new ApiError(ERROR_CODES.CONFLICT, message, 409);
    }

    static badRequest(message: string, details?: unknown) {
        return new ApiError(ERROR_CODES.VALIDATION_ERROR, message, 400, details);
    }
}
