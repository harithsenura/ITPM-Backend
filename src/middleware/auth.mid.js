import jwt from "jsonwebtoken"
import { UNAUTHORIZED } from "../constants/httpStatus.js"

export default (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(UNAUTHORIZED).send("Access denied. No token provided.")
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Add the decoded user to the request object
    req.user = decoded

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(UNAUTHORIZED).send("Invalid token")
  }
}