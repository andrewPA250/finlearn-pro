import { DashboardView } from "@/components/dashboard/DashboardView";
import { LESSON_META } from "@/lib/lessons";

export default function DashboardPage() {
  return <DashboardView lessonMeta={LESSON_META} />;
}
