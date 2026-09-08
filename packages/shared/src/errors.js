"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_AMOUNT"] = "INVALID_AMOUNT";
    ErrorCode["CURRENCY_MISMATCH"] = "CURRENCY_MISMATCH";
    ErrorCode["NEGATIVE_AMOUNT_NOT_ALLOWED"] = "NEGATIVE_AMOUNT_NOT_ALLOWED";
    ErrorCode["LEDGER_UNBALANCED"] = "LEDGER_UNBALANCED";
    ErrorCode["INVALID_ACCOUNT_TYPE"] = "INVALID_ACCOUNT_TYPE";
    ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    ErrorCode["RULE_VIOLATION"] = "RULE_VIOLATION";
    ErrorCode["KYC_FAILED"] = "KYC_FAILED";
    ErrorCode["AML_FLAGGED"] = "AML_FLAGGED";
    ErrorCode["COUNTRY_RESTRICTED"] = "COUNTRY_RESTRICTED";
    ErrorCode["AMOUNT_THRESHOLD_EXCEEDED"] = "AMOUNT_THRESHOLD_EXCEEDED";
    ErrorCode["IDEMPOTENCY_KEY_IN_USE"] = "IDEMPOTENCY_KEY_IN_USE";
    ErrorCode["IDEMPOTENCY_PAYLOAD_MISMATCH"] = "IDEMPOTENCY_PAYLOAD_MISMATCH";
    ErrorCode["INVALID_STATE_TRANSITION"] = "INVALID_STATE_TRANSITION";
    ErrorCode["ENTITY_NOT_FOUND"] = "ENTITY_NOT_FOUND";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["PROVIDER_ERROR"] = "PROVIDER_ERROR";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["AUDIT_IMMUTABLE_ERROR"] = "AUDIT_IMMUTABLE_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class DomainError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.name = 'DomainError';
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, DomainError.prototype);
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=errors.js.map