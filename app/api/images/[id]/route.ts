import { NextResponse } from "next/server"
import { readFile, access } from "fs/promises"
import path from "path"

// Render persistent disk mount point (or local fallback for dev)
const IMAGES_DIR = process.env.RENDER_DISK_PATH
  ? path.join(process.env.RENDER_DISK_PATH, "question-images")
  : path.join(process.cwd(), "public", "uploads")

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = (await params).id

    if (!id) {
      return NextResponse.json({ error: "Image filename required" }, { status: 400 })
    }

    // Sanitize: only allow filenames, no path traversal
    const fileName = path.basename(id)
    const filePath = path.join(IMAGES_DIR, fileName)

    // Infer content type from extension
    const ext = path.extname(fileName).toLowerCase()
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    }
    const fileType = mimeMap[ext] || "image/jpeg"

    // Verify file exists
    try {
      await access(filePath)
    } catch {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Read file from disk and serve it
    const imageData = await readFile(filePath)

    return new NextResponse(imageData, {
      headers: {
        "Content-Type": fileType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    console.error("Error retrieving image:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
