// Simple script to test CORS configuration
// Run this with Node.js to test if your CORS setup is working

import fetch from "node-fetch"

const API_URL = "https://welcoming-wisdom-production.up.railway.app"
const FRONTEND_URL = "https://hotel-management-system-red.vercel.app"

async function testCORS() {
  try {
    console.log("Testing CORS configuration...")

    // Test OPTIONS request (preflight)
    const optionsResponse = await fetch(`${API_URL}/cors-test`, {
      method: "OPTIONS",
      headers: {
        Origin: FRONTEND_URL,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type",
      },
    })

    console.log("OPTIONS response status:", optionsResponse.status)
    console.log("OPTIONS response headers:")
    optionsResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`)
    })

    // Test actual GET request
    const getResponse = await fetch(`${API_URL}/cors-test`, {
      method: "GET",
      headers: {
        Origin: FRONTEND_URL,
      },
    })

    console.log("\nGET response status:", getResponse.status)
    console.log("GET response headers:")
    getResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`)
    })

    const data = await getResponse.json()
    console.log("\nResponse data:", data)

    console.log("\nCORS test completed.")
  } catch (error) {
    console.error("CORS test failed:", error)
  }
}

testCORS()
