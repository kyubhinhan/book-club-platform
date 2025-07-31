'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Typography, Box, Container, Alert } from '@mui/material';
import type { BookWithSummary } from './BookCard';
import BookCard from './BookCard';
import LoadingBookCard from './LoadingBookCard';
import { useForm } from 'react-hook-form';

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface RecommendationFormData {
  category: Category;
}

const categories: Category[] = [
  { id: 'fiction', name: '소설', emoji: '📚' },
  { id: 'non-fiction', name: '비소설', emoji: '📖' },
  { id: 'self-help', name: '자기계발', emoji: '✨' },
  { id: 'business', name: '경영/경제', emoji: '💼' },
];

export default function BookRecommendation() {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<BookWithSummary[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadingRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(false);

  const { setValue, watch } = useForm<RecommendationFormData>({
    defaultValues: {
      category: categories[0],
    },
  });

  const selectedCategory = watch('category');

  // 컴포넌트 마운트 시 초기 책 목록 로드
  useEffect(() => {
    // 이미 초기 로딩이 완료되었으면 스킵
    if (isInitialLoadRef.current) return;

    isInitialLoadRef.current = true;
    loadBooksByCategory(selectedCategory.id, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  const loadBooksByCategory = useCallback(
    async (categoryId: string, pageNum: number) => {
      const isInitialLoad = pageNum === 1;

      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const response = await fetch(
          `/api/books?category=${categoryId}&page=${pageNum}&limit=10`
        );

        if (!response.ok) throw new Error('책 목록 조회에 실패했습니다.');

        const data = await response.json();
        const newBooks: BookWithSummary[] = data.books || [];

        setRecommendedBooks((prev) => [...prev, ...newBooks]);

        setPage(pageNum);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
        );
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [setLoading, setLoadingMore, setError, setRecommendedBooks, setPage]
  );

  const handleCategorySelect = async (category: Category) => {
    setValue('category', category);

    setRecommendedBooks([]);
    setPage(1);
    loadBooksByCategory(category.id, 1);
  };

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          const nextPage = page + 1;
          loadBooksByCategory(selectedCategory.id, nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadingMore, loading, page, selectedCategory, loadBooksByCategory]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 카테고리 선택 버튼 그룹 */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              카테고리 선택
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  variant={
                    selectedCategory.id === category.id
                      ? 'contained'
                      : 'outlined'
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                    px: 2,
                    fontSize: '0.8rem',
                    fontWeight: selectedCategory.id === category.id ? 600 : 400,
                    borderRadius: '16px',
                    minWidth: '100px',
                    flex: 1,
                  }}
                >
                  <span>{category.emoji}</span>
                  {category.name}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(3)].map((_, i) => (
            <LoadingBookCard key={i} />
          ))}
        </Box>
      )}

      {!loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recommendedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              currentBooks={recommendedBooks}
            />
          ))}

          {/* 무한 스크롤 로딩 인디케이터 */}
          <Box
            ref={loadingRef}
            sx={{ py: 2, textAlign: 'center', minHeight: '100px' }}
          >
            {loadingMore ? (
              <LoadingBookCard />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                스크롤하여 더 많은 책을 불러오세요
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
}
