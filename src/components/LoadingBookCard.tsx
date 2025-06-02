export default function LoadingBookCard() {
  return (
    <div className="flex gap-8 p-6 border rounded-xl bg-white h-[500px] overflow-hidden animate-pulse">
      {/* 책 이미지 스켈레톤 */}
      <div className="w-1/3 flex-shrink-0">
        <div className="w-full h-full bg-gray-200 rounded-lg" />
      </div>

      {/* 책 정보 스켈레톤 */}
      <div className="w-2/3 flex flex-col h-full">
        {/* 제목과 저자 정보 스켈레톤 */}
        <div className="mb-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>

        {/* 설명 스켈레톤 */}
        <div className="flex-1 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>

        {/* 추천 이유 스켈레톤 */}
        <div className="mt-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>

        {/* 버튼 스켈레톤 */}
        <div className="mt-4">
          <div className="h-12 bg-gray-200 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
}
