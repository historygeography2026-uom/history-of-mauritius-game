import { NextResponse } from "next/server"
import { readFile, access } from "fs/promises"
import path from "path"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    if (!foundFilePath) {
      console.warn(`[images API] Image "${fileName}" not found in any candidate directories:`, candidateDirs)
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Infer content type from extension
    const ext = path.extname(fileName).toLowerCase()
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
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
