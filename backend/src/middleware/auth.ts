import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Handle different JWT error types
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token expired:", error.expiredAt);
      res.status(401).json({ 
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid token:", error.message);
      res.status(403).json({ 
        message: "Invalid token",
        code: "INVALID_TOKEN"
      });
      return;
    }
    
    // Other errors
    console.error("Token verification error:", error);
    res.status(403).json({ 
      message: "Invalid token",
      code: "TOKEN_ERROR"
    });
  }
};

/**
 * Optional auth middleware for routes that support both guests and signed-in users.
 * If a valid token exists, req.user is populated. If token is missing/invalid, request continues as guest.
 */
export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    // Ignore invalid tokens for optional auth routes and continue as guest.
    console.warn("Optional auth token ignored:", error instanceof Error ? error.message : error);
  }

  next();
};
