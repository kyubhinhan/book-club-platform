import BookRecommendation from '@/components/BookRecommendation';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            독서 모임 운영을 더 쉽고 효율적으로
          </h1>
          <p className="text-xl text-gray-600">
            AI가 도와주는 맞춤형 도서 추천과 발제문 생성
          </p>
        </div>

        <BookRecommendation />
      </div>
    </main>
  );
}
