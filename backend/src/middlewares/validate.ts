import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Zod Validation Middleware Factory.
 * Returns an Express middleware that validates `req.body` against the provided Zod schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validasi gagal. Periksa data yang dikirim.',
        errors: formattedErrors,
      });
      return;
    }

    // Replace body with validated + transformed data
    req.body = result.data;
    next();
  };
}
