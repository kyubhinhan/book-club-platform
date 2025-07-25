'use client';

import { useState, useEffect } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Container,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { BookRecommendationManager } from '@/utils/book';
import type { BookWithSummary } from './BookCard';
import BookCard from './BookCard';
import LoadingBookCard from './LoadingBookCard';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<BookWithSummary[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, setValue, watch } = useForm<RecommendationFormData>({
    defaultValues: {
      category: categories[0],
    },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    const shouldRestoreState = searchParams?.get('restoreState') === 'true';

    if (shouldRestoreState) {
      const savedBookIds = BookRecommendationManager.getState();
      if (savedBookIds.length > 0) {
        fetchBooksByIds(savedBookIds);
      }
    }
  }, [searchParams]);

  const fetchBooksByIds = async (bookIds: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/books/getByIds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: bookIds }),
      });

      if (!response.ok) throw new Error('책 정보 조회에 실패했습니다.');

      const data = await response.json();
      setRecommendedBooks(data.books);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/books/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory.id,
          count: 5,
        }),
      });

      if (!response.ok) throw new Error('책 추천에 실패했습니다.');

      const data = await response.json();
      const books: BookWithSummary[] = data.books;
      setRecommendedBooks(books);

      BookRecommendationManager.saveState(books.map((book) => book.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    const category = categories.find((cat) => cat.id === selectedId);
    if (category) {
      setValue('category', category);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 4, fontSize: { xs: '1.75rem', sm: '2rem' } }}
      >
        AI 도서 추천
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl sx={{ flexGrow: 1 }}>
            <Select
              value={selectedCategory.id}
              onChange={handleCategoryChange}
              size="small"
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  py: 1.5,
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  value={category.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ marginRight: '8px' }}>{category.emoji}</span>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="small"
            sx={{ px: 3 }}
          >
            {loading ? '추천 중...' : '추천 받기'}
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

      {!loading && recommendedBooks.length > 0 && (
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
