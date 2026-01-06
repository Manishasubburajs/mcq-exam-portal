"use client";

import StudentLayout from "@/app/components/student_layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StudentLayout>{children}</StudentLayout>;
}