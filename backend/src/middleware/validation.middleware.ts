import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

/**
 * Express middleware factory that validates `req.body`, `req.query`, and
 * `req.params` against the provided Zod schema and replaces them with the
 * parsed (and transformed) values on success.
 *
 * @param schema - A Zod schema with optional `body`, `query`, and `params` keys.
 */
export function validate(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync({
        body:   req.body,
        query:  req.query,
        params: req.params,
      });

      if (validated.body   !== undefined) req.body   = validated.body;
      if (validated.query  !== undefined) req.query  = validated.query  as Record<string, string>;
      if (validated.params !== undefined) req.params = validated.params as Record<string, string>;

      next();
    } catch (error) {
      next(error);
    }
  };
}
