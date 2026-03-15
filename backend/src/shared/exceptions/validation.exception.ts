import { HttpStatus } from '@nestjs/common';

export interface ValidationErrorField {
  name: string;
  reason: string;
}

export class ValidationException {
  name: string;
  message: string;
  status: number;
  error: string;
  fields: ValidationErrorField[];

  constructor(fields: ValidationErrorField[] | string) {
    this.name = 'ValidationException';
    this.error = 'Invalid params';
    this.message = 'Invalid params send in request';
    this.status = HttpStatus.BAD_REQUEST;

    if (typeof fields === 'string') {
      this.fields = [{ name: 'validation', reason: fields }];
    } else {
      this.fields = fields;
    }
  }
}
