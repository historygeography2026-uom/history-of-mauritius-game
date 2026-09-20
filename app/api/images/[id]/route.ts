import { NextResponse } from "next/server"
import { readFile, access, readdir } from "fs/promises"
import path from "path"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rawId = (await params).id
    if (!rawId) {
      return NextResponse.json({ error: "Image filename required" }, { status: 400 })
    }

    // Decode URL component in case of encoded characters
    const decodedId = decodeURIComponent(rawId)
    const fileName = path.basename(decodedId)

    // Check multiple candidate storage directories so images are NEVER lost:
    const candidateDirs: string[] = []

    if (process.env.RENDER_DISK_PATH) {
      candidateDirs.push(path.join(process.env.RENDER_DISK_PATH, "question-images"))
      candidateDirs.push(process.env.RENDER_DISK_PATH)
    }

    candidateDirs.push(path.join(process.cwd(), "public", "uploads"))
    candidateDirs.push(path.join(process.cwd(), "public"))
    candidateDirs.push(path.join(process.cwd(), "uploads"))

    let foundFilePath: string | null = null

    for (const dir of candidateDirs) {
      const candidatePath = path.join(dir, fileName)
      try {
        await access(candidatePath)
        foundFilePath = candidatePath
        break
      } catch {
        // Continue searching other directories
      }
    }

    // Smart fallback 1: Question ID pattern matching (e.g. question-157-*)
    if (!foundFilePath) {
      const match = fileName.match(/^question-(\d+)/i)
      if (match) {
        const questionId = match[1]
        const uploadsDir = path.join(process.cwd(), "public", "uploads")
        try {
          const files = await readdir(uploadsDir)
          // Find any file for this question id
          const matchingFile = files.find(f => f.toLowerCase().startsWith(`question-${questionId}-`) || f.toLowerCase().startsWith(`question-${questionId}.`))
          if (matchingFile) {
            foundFilePath = path.join(uploadsDir, matchingFile)
          }
        } catch {
          // ignore directory read errors
        }

        // Smart fallback 2: Known educational assets for historical questions
        if (!foundFilePath) {
          const flagQuestions = ["96", "97", "157", "158", "267"]
          const coatQuestions = ["98", "159", "160", "170", "212", "213"]
          const champQuestions = ["95"]

          if (flagQuestions.includes(questionId)) {
            const candidate = path.join(process.cwd(), "public", "uploads", "mauritius-flag.png")
            try {
              await access(candidate)
              foundFilePath = candidate
            } catch {}
          } else if (coatQuestions.includes(questionId)) {
            const candidate = path.join(process.cwd(), "public", "uploads", "mauritius-coat-of-arms.png")
            try {
              await access(candidate)
              foundFilePath = candidate
            } catch {}
          } else if (champQuestions.includes(questionId)) {
            const candidate = path.join(process.cwd(), "public", "uploads", "champ-de-mars.jpg")
            try {
              await access(candidate)
              foundFilePath = candidate
            } catch {}
          }
        }
      }
    }

    if (!foundFilePath) {
      console.warn(`[images API] Image "${fileName}" not found in candidate directories or fallbacks`)
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Infer content type from extension
    const ext = path.extname(foundFilePath).toLowerCase()
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".jfif": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    }
    const fileType = mimeMap[ext] || "image/jpeg"

    // Read file and serve with caching
    const imageData = await readFile(foundFilePath)

    return new NextResponse(imageData, {
      headers: {
        "Content-Type": fileType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    console.error("[images API] Error retrieving image:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
