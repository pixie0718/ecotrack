/**
 * Augments the global Express `Request` interface so that `req.user` is
 * available after the `authenticate` middleware runs, without requiring
 * unsafe `(req as any)` casts throughout the codebase.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id:    string;
        email: string;
      };
    }
  }
}

export {};
