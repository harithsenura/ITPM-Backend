// CORS middleware to handle all CORS-related headers
export default function corsMiddleware(req, res, next) {
  // Set CORS headers for all responses
  const allowedOrigins = ["https://hotel-management-system-red.vercel.app", "http://localhost:3000"]
  const origin = req.headers.origin

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin)
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Expires, Pragma",
  )
  res.header("Access-Control-Allow-Credentials", "true")

  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  next()
}
