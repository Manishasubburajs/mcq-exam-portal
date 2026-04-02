// export const dynamic = "force-dynamic";
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const attemptId = searchParams.get("attemptId");

//     if (!attemptId) {
//       return NextResponse.json(
//         { error: "attemptId is required" },
//         { status: 400 }
//       );
//     }

//     // 🔥 Fetch answers with questions
//     const answers = await prisma.student_answers.findMany({
//       where: {
//         attempt_id: Number(attemptId),
//       },
//       include: {
//         question: true,
//       },
//       orderBy: {
//         question_id: "asc", // fallback ordering
//       },
//     });

//     // 🧠 Transform data for frontend
//     const questionReview = answers.map((ans, index) => {
//       const q = ans.question;

//       const options = [
//         { text: q.option_a, key: "A" },
//         { text: q.option_b, key: "B" },
//         { text: q.option_c, key: "C" },
//         { text: q.option_d, key: "D" },
//       ].filter((opt) => opt.text !== null);

//       return {
//         id: q.question_id,
//         questionOrder: index + 1,
//         text: q.question_text,
//         timeTaken: ans.time_taken_seconds || 0,
//         explanation: q.explanation,

//         status:
//           ans.selected_answer === null
//             ? "unanswered"
//             : ans.is_correct
//             ? "correct"
//             : "incorrect",

//         options: options.map((opt) => ({
//           text: opt.text,
//           correct: q.correct_answer === opt.key,
//           selected: ans.selected_answer === opt.key,
//         })),
//       };
//     });

//     return NextResponse.json(questionReview);
//   } catch (error) {
//     console.error("Question Review API Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch question review" },
//       { status: 500 }
//     );
//   }
// }

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get("attemptId");

    if (!attemptId) {
      return NextResponse.json(
        { error: "attemptId is required" },
        { status: 400 },
      );
    }

    // ✅ 1. Fetch ALL questions shown in exam
    const questions = await prisma.student_exam_questions.findMany({
      where: {
        attempt_id: Number(attemptId),
      },
      include: {
        questions: true,
      },
      orderBy: {
        question_order: "asc",
      },
    });

    // ✅ 2. Fetch answers
    const answers = await prisma.student_answers.findMany({
      where: {
        attempt_id: Number(attemptId),
      },
    });

    // ✅ 3. Map answers
    const answerMap = new Map();
    answers.forEach((a) => {
      answerMap.set(a.question_id, a);
    });

    // ✅ 4. Transform data
    const questionReview = questions.map((qItem) => {
      const q = qItem.questions;
      const ans = answerMap.get(q.question_id);

      const selectedAnswer = ans?.selected_answer || null;

      const options = [
        { text: q.option_a, key: "A" },
        { text: q.option_b, key: "B" },
        { text: q.option_c, key: "C" },
        { text: q.option_d, key: "D" },
      ].filter((opt) => opt.text !== null);

      return {
        id: q.question_id,
        questionOrder: qItem.question_order,
        text: q.question_text,
        timeTaken: ans?.time_taken_seconds || 0,
        explanation: q.explanation,

        status: selectedAnswer
          ? ans?.is_correct
            ? "correct"
            : "incorrect"
          : "unanswered",

        options: options.map((opt) => ({
          text: opt.text,
          correct: q.correct_answer === opt.key,
          selected: selectedAnswer === opt.key,
        })),
      };
    });

    return NextResponse.json(questionReview);
  } catch (error) {
    console.error("Question Review API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch question review" },
      { status: 500 },
    );
  }
}
