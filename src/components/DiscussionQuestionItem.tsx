interface DiscussionQuestionItemProps {
  question: string;
  index: number;
}

export default function DiscussionQuestionItem({
  question,
  index,
}: DiscussionQuestionItemProps) {
  return (
    <div className="flex items-center p-4 bg-primary-50 rounded-lg group">
      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-primary-600 text-white rounded-full mr-3 text-base">
        {index + 1}
      </span>
      <p className="text-gray-800 text-base leading-relaxed flex-1">
        {question}
      </p>
    </div>
  );
}
