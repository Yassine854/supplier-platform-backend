import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

// Middleware to authenticate users
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  
  if (!token) {
    return res.status(401).json({ message: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token.split(" ")[1], SECRET_KEY) as { id: number; role: string };
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

export const authorizeSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ message: "Access Forbidden: Super Admins Only" });
  }
  next();
};
