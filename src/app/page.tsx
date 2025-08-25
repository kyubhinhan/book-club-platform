import BookRecommendation from '@/components/BookRecommendation';
import { CategoryId } from '@/types/book';

interface HomeProps {
  searchParams: { category?: CategoryId };
}

export default function Home({ searchParams }: HomeProps) {
  const selectedCategory: CategoryId = searchParams.category || '소설';

  return (
    <div className="bg-gray-50 flex flex-col items-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        독서 모임 운영을 더 쉽고 효율적으로
      </h1>
      <p className="text-xl text-gray-600 mb-2">
        AI가 도와주는 맞춤형 도서 추천과 발제문 생성
      </p>
      <p className="text-xs text-gray-400 mb-12">
        📚 매일 오후 2시에 AI 추천 목록이 갱신됩니다
      </p>
      <BookRecommendation selectedCategory={selectedCategory} />
    </div>
  );
}
