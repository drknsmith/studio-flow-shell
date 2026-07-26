import type { Instructor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type InstructorAvatarColor = Instructor["avatarColor"];

const AVATAR_STYLES: Record<InstructorAvatarColor, { bg: string; text: string }> = {
  dusk: { bg: "var(--palette-dusk-blue)", text: "var(--palette-white)" },
  apricot: { bg: "var(--palette-apricot-cream)", text: "#3a4268" },
  sandy: { bg: "var(--palette-sandy-brown)", text: "#3a4268" },
  pumpkin: { bg: "var(--palette-pumpkin-spice)", text: "var(--palette-white)" },
};

const SIZE_CLASSES = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function InstructorAvatar({
  instructor,
  size = "md",
  className,
}: {
  instructor: Pick<Instructor, "initials" | "avatarColor">;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const style = AVATAR_STYLES[instructor.avatarColor];

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-semibold",
        SIZE_CLASSES[size],
        className,
      )}
      style={{ background: style.bg, color: style.text }}
      aria-hidden
    >
      {instructor.initials}
    </div>
  );
}
