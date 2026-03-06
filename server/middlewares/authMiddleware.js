import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";

// required auth
export const protect = asyncHandler(async (req, res, next) => {
  console.log(`\n---- DEBUG: AUTH MIDDLEWARE HIT [${req.method} ${req.originalUrl}] ----`);

  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  const token = bearerToken || req.cookies?.accessToken;
  console.log("DEBUG: Protected route Cookies received:", Object.keys(req.cookies || {}));
  console.log("DEBUG: Access token present?", !!token);

  if (!token) {
    console.log("DEBUG: Middleware block -> No access token found (401).");
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    console.log(`DEBUG: Token verification SUCCESS for userId: ${req.userId}. Proceeding...`);
    next();
  } catch (error) {
    console.log("DEBUG: Token verification FAILED.");
    console.log(`DEBUG: JWT Error Name: ${error.name} | Message: ${error.message}`);

    if (error.name === "TokenExpiredError") {
      console.log("DEBUG: The Access Token has expired (15m elapsed). Frontend should attempt refresh next.");
    } else {
      console.log("DEBUG: Token signature mismatch or invalid format.");
    }

    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = bearerToken || req.cookies?.accessToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
  } catch (error) {
    req.userId = undefined;
  }

  next();
});
