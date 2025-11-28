import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No questions provided" },
        { status: 400 }
      );
    }

    // Validate and normalize questions
    const validDifficulties = ["Easy", "Medium", "Hard"];
    const normalizedQuestions: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      try {
        // Validate required fields
        if (!q.question_text || !q.correct_answer || !q.subject_id) {
          errors.push(`Question ${i + 1}: Missing required fields`);
          continue;
        }

        // Validate correct answer is a single character (A, B, C, or D)
        const validAnswers = ['A', 'B', 'C', 'D'];
        if (!validAnswers.includes(q.correct_answer.toUpperCase())) {
          errors.push(`Question ${i + 1}: Correct answer must be one of: A, B, C, or D`);
          continue;
        }

        // Validate difficulty
        const difficulty = validDifficulties.includes(q.difficulty) ? q.difficulty : "Medium";

        // Validate points
        const points = typeof q.points === "number" && q.points > 0 ? q.points : 1;

        // Ensure subject exists
        const subjectExists = await prisma.subjects.findUnique({
          where: { subject_id: q.subject_id },
        });

        if (!subjectExists) {
          errors.push(`Question ${i + 1}: Invalid subject selected`);
          continue;
        }

        normalizedQuestions.push({
          question_text: q.question_text.trim(),
          option_a: q.option_a?.trim() || "",
          option_b: q.option_b?.trim() || "",
          option_c: q.option_c?.trim() || "",
          option_d: q.option_d?.trim() || "",
          correct_answer: q.correct_answer.trim().toUpperCase(),
          marks: points,
          difficulty: difficulty as any,
          subject_id: q.subject_id,
          topic_id: q.topic_id || null,
          is_draft: q.is_draft ? true : false,
        });
      } catch (err) {
        errors.push(`Question ${i + 1}: ${err}`);
      }
    }

    if (normalizedQuestions.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No valid questions to upload",
          validation_errors: errors 
        },
        { status: 400 }
      );
    }

    // Insert all questions in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdQuestions = [];
      
      for (const questionData of normalizedQuestions) {
        const created = await tx.questions.create({
          data: questionData,
        });
        createdQuestions.push(created);
      }
      
      return createdQuestions;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${result.length} questions`,
      count: result.length,
      validation_errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to upload questions",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
