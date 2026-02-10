import { NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"

// Render persistent disk mount point (or local fallback for dev)
const IMAGES_DIR = process.env.RENDER_DISK_PATH
  ? path.join(process.env.RENDER_DISK_PATH, "question-images")
  : path.join(process.cwd(), "public", "uploads")

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const questionId = formData.get("questionId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, GIF, WebP" },
        { status: 400 }
      )
    }

    // Limit file size to 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "jpg"
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = questionId
      ? `question-${questionId}-${timestamp}.${fileExt}`
      : `temp-${timestamp}-${randomId}.${fileExt}`
    const filePath = path.join(IMAGES_DIR, fileName)

    // Create directory if it doesn't exist
    await mkdir(IMAGES_DIR, { recursive: true })

    // Convert file to buffer and write to disk
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)

    // Return the URL path — stored in questions.image_url by the admin
    const imageUrl = `/api/images/${fileName}`

    return NextResponse.json({
      success: true,
      url: imageUrl,
    })
  } catch (error: any) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Delete an image file from disk
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (url) {
      const fileName = url.split("/").pop()
      if (fileName) {
        const filePath = path.join(IMAGES_DIR, fileName)
        try { await unlink(filePath) } catch { /* file may already be gone */ }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
