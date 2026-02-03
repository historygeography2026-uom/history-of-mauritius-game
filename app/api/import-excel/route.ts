import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Helper to check if URL is external (not Supabase Storage)
function isExternalUrl(url: string): boolean {
  if (!url || url.trim() === '') return false
  if (url.startsWith('data:')) return false
  if (url.includes('supabase.co/storage')) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

// Download external image and upload to Supabase Storage
async function downloadAndStoreImage(url: string, supabase: any): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Validate content type
    if (!contentType.startsWith('image/')) {
      console.error('[v0] Invalid content type:', contentType)
      return null
    }
    
    // Limit file size to 5MB
    if (buffer.byteLength > 5 * 1024 * 1024) {
      console.error('[v0] Downloaded image exceeds 5MB limit')
      return null
    }
    
    const filename = `imported-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) {
      console.error('[v0] Storage upload error:', error)
      return null
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(filename)
    
    return publicUrlData.publicUrl
  } catch (error) {
    console.error('[v0] Error downloading/storing image:', error)
    return null
  }
}

// Upload image buffer to Supabase Storage
async function uploadImageBuffer(buffer: Buffer, fileName: string, supabase: any): Promise<string | null> {
  try {
    // Determine content type from file extension
    let contentType = 'image/jpeg'
    if (fileName.toLowerCase().endsWith('.png')) contentType = 'image/png'
    else if (fileName.toLowerCase().endsWith('.gif')) contentType = 'image/gif'
    else if (fileName.toLowerCase().endsWith('.webp')) contentType = 'image/webp'
    
    // Validate file size
    if (buffer.byteLength > 5 * 1024 * 1024) {
      console.error('[v0] Image file exceeds 5MB:', fileName)
      return null
    }
    
    const uploadName = `imported-${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName.split('/').pop()}`
    
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(uploadName, buffer, {
        contentType,
        upsert: true
      })
    
    if (error) {
      console.error('[v0] Storage upload error:', error)
      return null
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(uploadName)
    
    return publicUrlData.publicUrl
  } catch (error) {
    console.error('[v0] Error uploading image buffer:', error)
    return null
  }
}

interface ExcelQuestion {
  subject: string
  level: number
  type: string
  question: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correctAnswer?: string
  leftItem1?: string
  rightItem1?: string
  leftItem2?: string
  rightItem2?: string
  leftItem3?: string
  rightItem3?: string
  leftItem4?: string
  rightItem4?: string
  answer?: string
  step1?: string
  step2?: string
  step3?: string
  step4?: string
  statement?: string
  isTrue?: string
  timer: number
  imageUrl?: string
}

export async function POST(req: NextRequest) {
  try {
    // Initialize Supabase client with SERVICE ROLE key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[v0] Missing Supabase environment variables')
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase credentials" },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const formData = await req.formData()
    const questionsJson = formData.get("questions") as string
    const createdByRaw = (formData.get("createdBy") as string) || "MES"
    const createdBy = createdByRaw.trim().toUpperCase()
    
    console.log('[v0] Import API called with:', {
      createdByRaw,
      createdBy,
      serviceKeyExists: !!supabaseServiceKey,
      serviceKeyLength: supabaseServiceKey?.length || 0
    })
    
    if (!questionsJson) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 })
    }
    
    const questions: ExcelQuestion[] = JSON.parse(questionsJson)
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No questions in JSON" }, { status: 400 })
    }
    
    console.log('[v0] Parsed questions from FormData:', JSON.stringify(questions, null, 2))
    
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    
    // Validate createdBy immediately
    if (!createdBy || (createdBy !== 'MES' && createdBy !== 'MIE')) {
      console.error('[v0] Invalid createdBy:', createdBy)
      return NextResponse.json({ 
        error: `Invalid createdBy value: "${createdBy}". Must be "MES" or "MIE"`,
        successCount: 0,
        errorCount: questions.length,
        errors: [`Invalid createdBy: "${createdBy}". This field must be "MES" (Mauritius Education System) or "MIE" (Mauritius Institute of Education).`]
      }, { status: 400 })
    }
    
    console.log('[v0] Using SERVICE_ROLE_KEY for database operations')
    console.log('[v0] Starting import of', questions.length, 'questions with createdBy:', createdBy)
    
    for (const q of questions) {
      try {
        console.log('[v0] Processing question:', {
          question: q.question.substring(0, 50),
          type: q.type,
          hasLeftItem1: !!q.leftItem1,
          hasRightItem1: !!q.rightItem1,
          leftItem1: q.leftItem1,
          rightItem1: q.rightItem1,
        })
        // Get subject ID - use limit(1) to handle duplicates
        const { data: subjectDataArr } = await supabase.from("subjects").select("id").ilike("name", q.subject).limit(1)
        const subjectData = subjectDataArr?.[0]

        if (!subjectData) {
          errors.push(`Subject not found: ${q.subject}`)
          errorCount++
          continue
        }

        // Get level ID
        const { data: levelDataArr } = await supabase.from("levels").select("id").eq("level_number", q.level).limit(1)
        const levelData = levelDataArr?.[0]

        if (!levelData) {
          errors.push(`Level not found: ${q.level}`)
          errorCount++
          continue
        }

        // Get question type ID
        const { data: typeDataArr } = await supabase.from("question_types").select("id").eq("name", q.type).limit(1)
        const typeData = typeDataArr?.[0]

        if (!typeData) {
          errors.push(`Question type not found: ${q.type}`)
          errorCount++
          continue
        }

        // Handle image: use imageUrl directly
        let finalImageUrl: string | null = null
        
        // If imageUrl provided and it's external, download and store it
        if (q.imageUrl && isExternalUrl(q.imageUrl)) {
          try {
            finalImageUrl = await downloadAndStoreImage(q.imageUrl, supabase)
          } catch (imgError) {
            console.error(`[v0] Failed to download/store image: ${imgError}`)
            // Keep going without image
          }
        }

        // Insert question
        const insertPayload: any = {
          subject_id: subjectData.id,
          level_id: levelData.id,
          question_type_id: typeData.id,
          question_text: q.question,
          image_url: finalImageUrl,
          timer_seconds: q.timer || 30,
        }
        
        // IMPORTANT: Only add created_by if it's a valid value
        // This helps us isolate the constraint issue
        if (createdBy === 'MES' || createdBy === 'MIE') {
          insertPayload.created_by = createdBy
          console.log('[v0] About to insert with created_by:', {
            questionPreview: q.question.substring(0, 50),
            createdBy: createdBy,
            valueIsString: typeof createdBy === 'string',
            length: createdBy.length,
            equals_MES: createdBy === 'MES',
            equals_MIE: createdBy === 'MIE'
          })
        } else {
          console.log('[v0] About to insert WITHOUT created_by (invalid value):', {
            questionPreview: q.question.substring(0, 50),
            createdBy: createdBy,
            typeOf: typeof createdBy
          })
        }
        
        const { data: questionData, error: qError } = await supabase
          .from("questions")
          .insert(insertPayload)
          .select()
          .single()

        if (qError) {
          console.error('[v0] Question insert FAILED:', {
            questionPreview: q.question.substring(0, 50),
            code: qError.code,
            message: qError.message,
            details: qError.details,
            hint: qError.hint,
            statusCode: qError.status,
            failedPayload: insertPayload
          })
          // DON'T throw - collect errors instead
          errors.push(`Failed to insert question "${q.question.substring(0, 50)}...": ${qError.message}`)
          errorCount++
          continue
        }
        
        console.log('[v0] Question inserted successfully:', questionData.id)

        // Insert type-specific data
        if (q.type === "mcq") {
          const options = [
            { option_text: q.optionA || "", is_correct: q.correctAnswer === q.optionA },
            { option_text: q.optionB || "", is_correct: q.correctAnswer === q.optionB },
            { option_text: q.optionC || "", is_correct: q.correctAnswer === q.optionC },
            { option_text: q.optionD || "", is_correct: q.correctAnswer === q.optionD },
          ]

          await supabase.from("mcq_options").insert(
            options.map((opt, idx) => ({
              question_id: questionData.id,
              option_order: idx + 1,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
            })),
          )
        } else if (q.type === "matching") {
          console.log('[v0] Processing matching question:', {
            id: questionData.id,
            leftItem1: q.leftItem1,
            rightItem1: q.rightItem1,
            leftItem2: q.leftItem2,
            rightItem2: q.rightItem2,
            leftItem3: q.leftItem3,
            rightItem3: q.rightItem3,
            leftItem4: q.leftItem4,
            rightItem4: q.rightItem4,
          })
          const pairs = []
          if (q.leftItem1 && q.rightItem1) pairs.push({ left_item: q.leftItem1, right_item: q.rightItem1 })
          if (q.leftItem2 && q.rightItem2) pairs.push({ left_item: q.leftItem2, right_item: q.rightItem2 })
          if (q.leftItem3 && q.rightItem3) pairs.push({ left_item: q.leftItem3, right_item: q.rightItem3 })
          if (q.leftItem4 && q.rightItem4) pairs.push({ left_item: q.leftItem4, right_item: q.rightItem4 })

          console.log('[v0] Pairs to insert:', pairs.length, pairs)

          if (pairs.length > 0) {
            const { error: pError } = await supabase.from("matching_pairs").insert(
              pairs.map((p, idx) => ({
                question_id: questionData.id,
                pair_order: idx + 1,
                left_item: p.left_item,
                right_item: p.right_item,
              })),
            )
            if (pError) {
              console.error('[v0] Error inserting matching pairs:', pError)
              errors.push(`Failed to insert matching pairs for question ${questionData.id}: ${pError.message}`)
            } else {
              console.log('[v0] Matching pairs inserted successfully for question:', questionData.id)
            }
          } else {
            console.warn('[v0] No matching pairs found for matching question:', questionData.id)
          }
        } else if (q.type === "fill") {
          await supabase.from("fill_answers").insert({
            question_id: questionData.id,
            answer_text: q.answer || "",
            case_sensitive: false,
          })
        } else if (q.type === "reorder") {
          const items = []
          if (q.step1) items.push({ item_text: q.step1, correct_position: 1 })
          if (q.step2) items.push({ item_text: q.step2, correct_position: 2 })
          if (q.step3) items.push({ item_text: q.step3, correct_position: 3 })
          if (q.step4) items.push({ item_text: q.step4, correct_position: 4 })

          if (items.length > 0) {
            await supabase.from("reorder_items").insert(
              items.map((item, idx) => ({
                question_id: questionData.id,
                item_order: idx + 1,
                item_text: item.item_text,
                correct_position: item.correct_position,
              })),
            )
          }
        } else if (q.type === "truefalse") {
          await supabase.from("truefalse_answers").insert({
            question_id: questionData.id,
            correct_answer: q.isTrue?.toLowerCase() === "true",
            explanation: null,
          })
        }

        successCount++
      } catch (error: any) {
        const errorMessage = error?.message || error?.details || String(error)
        console.error("[v0] Error importing question:", errorMessage, error)
        errors.push(`Failed: ${q.question?.substring(0, 30)}... - Error: ${errorMessage}`)
        errorCount++
      }
    }

    return NextResponse.json({
      message: `Imported ${successCount} questions successfully. ${errorCount} failed.`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    })
  } catch (error) {
    console.error("[v0] Import error:", error)
    return NextResponse.json({ error: "Failed to import questions" }, { status: 500 })
  }
}
