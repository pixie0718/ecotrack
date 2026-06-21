import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema<any>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (validated.body !== undefined) req.body = validated.body;
      if (validated.query !== undefined) req.query = validated.query as any;
      if (validated.params !== undefined) req.params = validated.params as any;

      next();
    } catch (error) {
      next(error);
    }
  };
}
