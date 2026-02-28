/**
 * Simple XSS prevention utility
 * Sanitizes user input by escaping HTML special characters
 * For production, consider using DOMPurify library
 */

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return ""
  
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  }
  
  return text.replace(/[&<>"'\/]/g, (char) => map[char])
}

/**
 * Validate text input (remove suspicious patterns)
 */
export function sanitizeTextInput(input: string): string {
  if (!input) return ""
  
  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on(?:load|error|click|mouseover|keydown|keyup)\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .trim()
  
  // Limit length to prevent abuse
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000)
  }
  
  return sanitized
}

/**
 * Validate email input
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ""
  
  // Remove whitespace
  let sanitized = email.trim().toLowerCase()
  
  // Basic validation - only allow common email patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    return ""
  }
  
  return sanitized
}

/**
 * Validate URL input
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ""
  
  try {
    const urlObj = new URL(url)
    // Only allow http/https
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return ""
    }
    return urlObj.toString()
  } catch {
    return ""
  }
}

/**
 * Sanitize JSON input to prevent JSON injection
 */
export function sanitizeJson(input: string): string {
  if (!input) return ""
  
  try {
    // Parse and re-stringify to ensure valid JSON
    const parsed = JSON.parse(input)
    return JSON.stringify(parsed)
  } catch {
    return ""
  }
}
