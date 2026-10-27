/** The assistant's mark: a speech bubble holding a spark, with a small second spark outside. */
export default function AssistantIcon({ size = 28, bubble = '#fff', spark = '#0A7A4F', accent = '#FFD23F' }: { size?: number; bubble?: string; spark?: string; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path d="M15 4C8.4 4 3 8.9 3 15c0 3.3 1.6 6.2 4.1 8.2L6 28.3c-.1.6.5 1 1 .8l5.1-2.5c1 .2 1.9.3 2.9.3 6.6 0 12-4.9 12-11S21.6 4 15 4Z" fill={bubble} />
      <path d="M15 9.6l1.7 4.7 4.7 1.7-4.7 1.7L15 22.4l-1.7-4.7L8.6 16l4.7-1.7L15 9.6Z" fill={spark} />
      <path d="M26.5 1.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4Z" fill={accent} />
    </svg>
  )
}
