interface ContentDisplayProps {
  content: string;
}

export function ContentDisplay({ content }: ContentDisplayProps) {
  return (
    <div className="text-sm sm:text-base mb-5 whitespace-pre-line prose prose-sm sm:prose-base dark:prose-invert max-w-none">
      {content}
    </div>
  );
}
