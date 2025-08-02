'use client';

import { useState, useEffect, useRef } from 'react';
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
  { id: '소설', name: '소설', emoji: '📚' },
  { id: '비소설', name: '비소설', emoji: '📖' },
  { id: '자기계발', name: '자기계발', emoji: '✨' },
  { id: '경영/경제', name: '경영/경제', emoji: '💼' },
];

export default function BookRecommendation() {
  const [loading, setLoading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<BookWithSummary[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

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
    loadBooksByCategory(selectedCategory.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  const loadBooksByCategory = async (categoryId: string) => {
    setLoading(true);
    setError(null);

    try {
      // DB에서 기존 책들을 가져옴
      const dbResponse = await fetch(`/api/books?category=${categoryId}`);

      if (!dbResponse.ok) throw new Error('책 목록 조회에 실패했습니다.');

      const dbData = await dbResponse.json();
      const books: BookWithSummary[] = dbData.books || [];

      setRecommendedBooks(books);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAiRecommendations = async (categoryId: string) => {
    setLoadingAi(true);
    setError(null);

    try {
      const aiResponse = await fetch('/api/books/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: categoryId,
          count: 10,
        }),
      });

      if (!aiResponse.ok) throw new Error('AI 추천 생성에 실패했습니다.');

      const aiData = await aiResponse.json();
      const aiBooks: BookWithSummary[] = aiData.books || [];

      setRecommendedBooks(aiBooks);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'AI 추천 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCategorySelect = async (category: Category) => {
    setValue('category', category);

    setRecommendedBooks([]);
    loadBooksByCategory(category.id);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          {/* 카테고리 선택 버튼 그룹 */}
          <Box sx={{ flex: 1 }}>
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

          {/* AI 추천 버튼 - 오른쪽 상단 */}
          <Button
            onClick={() => loadAiRecommendations(selectedCategory.id)}
            disabled={loadingAi}
            variant="outlined"
            size="small"
            startIcon={loadingAi ? <div>⏳</div> : <div>🤖</div>}
            sx={{
              py: 0.5,
              px: 1.5,
              fontSize: '0.75rem',
              fontWeight: 500,
              borderRadius: '8px',
              minWidth: 'auto',
              ml: 2,
            }}
          >
            {loadingAi ? '생성 중...' : 'AI 추천'}
          </Button>
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
        </Box>
      )}
    </Container>
  );
}
