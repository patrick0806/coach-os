import { ZodSchema } from 'zod';
import { ValidationException, ValidationErrorField } from '@shared/exceptions';

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const fieldErrors: ValidationErrorField[] = result.error.issues.map((err) => {
      const fieldName = err.path && err.path.length > 0
        ? err.path.filter(p => p !== undefined && p !== null).join('.')
        : 'body';

      const fieldReason = err.message || 'Invalid value';

      return {
        name: fieldName || 'unknown',
        reason: fieldReason,
      };
    });

    throw new ValidationException(fieldErrors);
  }

  return result.data;
}