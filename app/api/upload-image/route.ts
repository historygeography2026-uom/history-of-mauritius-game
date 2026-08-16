import { NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function POST(request: Request) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const questionId = formData.get("questionId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG" },
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

    // Generate clean filename
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = questionId
      ? `question-${questionId}-${timestamp}.${fileExt}`
      : `upload-${timestamp}-${randomId}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save to all candidate locations to ensure persistence
    const targetDirs: string[] = []

    if (process.env.RENDER_DISK_PATH) {
      targetDirs.push(path.join(process.env.RENDER_DISK_PATH, "question-images"))
    }
    targetDirs.push(path.join(process.cwd(), "public", "uploads"))

    for (const dir of targetDirs) {
      try {
        await mkdir(dir, { recursive: true })
        await writeFile(path.join(dir, fileName), buffer)
      } catch (err) {
        console.warn(`[upload-image] Warning writing to ${dir}:`, err)
      }
    }

    // Standardized URL format
    const imageUrl = `/api/images/${fileName}`

    return NextResponse.json({
      success: true,
      url: imageUrl,
    })
  } catch (error: any) {
    console.error("[upload-image] Error uploading image:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authError = verifyAdminToken(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (url) {
      const fileName = path.basename(url)
      if (fileName) {
        const targetDirs: string[] = []
        if (process.env.RENDER_DISK_PATH) {
          targetDirs.push(path.join(process.env.RENDER_DISK_PATH, "question-images"))
        }
        targetDirs.push(path.join(process.cwd(), "public", "uploads"))

        for (const dir of targetDirs) {
          try {
            await unlink(path.join(dir, fileName))
          } catch {
            // ignore if not present in that folder
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[upload-image] Error deleting image:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
