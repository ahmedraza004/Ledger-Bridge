import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;

    switch (exception.code) {
      case ErrorCode.ENTITY_NOT_FOUND:
        status = HttpStatus.NOT_FOUND;
        break;
      case ErrorCode.UNAUTHORIZED:
        status = HttpStatus.UNAUTHORIZED;
        break;
      case ErrorCode.FORBIDDEN:
        status = HttpStatus.FORBIDDEN;
        break;
      case ErrorCode.IDEMPOTENCY_KEY_IN_USE:
        status = HttpStatus.CONFLICT;
        break;
      case ErrorCode.IDEMPOTENCY_PAYLOAD_MISMATCH:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      case ErrorCode.LEDGER_UNBALANCED:
      case ErrorCode.CURRENCY_MISMATCH:
      case ErrorCode.INVALID_STATE_TRANSITION:
      case ErrorCode.RULE_VIOLATION:
      case ErrorCode.KYC_FAILED:
      case ErrorCode.AML_FLAGGED:
      case ErrorCode.COUNTRY_RESTRICTED:
      case ErrorCode.AMOUNT_THRESHOLD_EXCEEDED:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      default:
        status = HttpStatus.BAD_REQUEST;
    }

    response.status(status).json({
      statusCode: status,
      errorCode: exception.code,
      message: exception.message,
      details: exception.details,
      timestamp: new Date().toISOString()
    });
  }
}
