import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Check for attempts that are in progress for more than exam duration + 10 minutes
    const stuckAttempts = await prisma.student_exam_attempts.findMany({
      where: {
        status: "in_progress",
        AND: [
          {
            OR: [
              // Attempts with duration set
              {
                exam: {
                  time_limit_minutes: { not: null, gt: 0 }
                },
                start_time: {
                  lt: new Date(Date.now() - (1000 * 60 * (10 + 10))) // 10 minutes buffer
                }
              },
              // Attempts without duration (practice) that are over 24 hours old
              {
                exam: {
                  time_limit_minutes: { equals: null }
                },
                start_time: {
                  lt: new Date(Date.now() - (1000 * 60 * 60 * 24))
                }
              }
            ]
          }
        ]
      },
      include: {
        exam: true
      }
    });

    for (const attempt of stuckAttempts) {
      try {
        // Calculate time taken
        const startTime = new Date(attempt.start_time);
        const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

        // Get total questions in exam
        const totalQuestions = await prisma.exam_questions.count({
          where: { exam_id: attempt.exam_id }
        });

        // Get answers for this attempt
        const answers = await prisma.student_answers.findMany({
          where: { attempt_id: attempt.attempt_id },
          include: {
            question: { select: { correct_answer: true } }
          }
        });

        // Evaluate answers
        let correct = 0;
        let wrong = 0;

        answers.forEach(ans => {
          if (ans.selected_answer === ans.question.correct_answer) {
            correct++;
          } else if (ans.selected_answer) {
            wrong++;
          }
        });

        const answeredCount = answers.length;
        const unanswered = totalQuestions - answeredCount;

        const MARK_PER_Q = 2;
        const NEGATIVE = 0.66;
        const PASS_PERCENTAGE = 33;

        let score = correct * MARK_PER_Q - wrong * NEGATIVE;
        score = Math.max(0, score);

        const totalMarks = totalQuestions * MARK_PER_Q;
        const passMark = (totalMarks * PASS_PERCENTAGE) / 100;
        const result = score >= passMark ? "pass" : "fail";

        // Update attempt status to completed
        await prisma.student_exam_attempts.update({
          where: { attempt_id: attempt.attempt_id },
          data: {
            status: "completed",
            end_time: new Date(),
            score: score,
            correct_answers: correct,
            wrong_answers: wrong,
            unanswered,
            total_time_seconds: timeTaken,
          },
        });

        console.log(`Automatically submitted stuck attempt: ${attempt.attempt_id}`);
      } catch (error) {
        console.error(`Error submitting attempt ${attempt.attempt_id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${stuckAttempts.length} stuck attempts`,
      processed: stuckAttempts.length
    });
  } catch (error) {
    console.error("Error checking for stuck attempts:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to check for stuck attempts"
    }, { status: 500 });
  }
}
