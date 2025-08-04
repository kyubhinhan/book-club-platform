'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Box, TextField, Button, Typography } from '@mui/material';
import BookCard from '@/components/BookCard';
import LoadingBookCard from '@/components/LoadingBookCard';
import { Book } from '@/types/book';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 검색 실행
  const searchBooks = useCallback(async (term: string, pageNum: number = 1) => {
    if (!term.trim()) {
      setBooks([]);
      setHasMore(true);
      return;
    }

    const isInitialLoad = pageNum === 1;

    if (isInitialLoad) {
      setLoading(true);
      setHasSearched(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(term)}&page=${pageNum}&limit=10`
      );

      if (!response.ok) throw new Error('도서 검색에 실패했습니다.');

      const data = await response.json();
      const newBooks: Book[] = data.books || [];

      setBooks((prev) => {
        if (isInitialLoad) {
          return newBooks;
        } else {
          // 중복 제거
          const existingIds = new Set(prev.map((book) => book.id));
          const uniqueNewBooks = newBooks.filter(
            (book) => !existingIds.has(book.id)
          );
          return [...prev, ...uniqueNewBooks];
        }
      });

      setHasMore(data.hasMore || false);
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
  }, []);

  // 무한 스크롤 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading && hasMore) {
          const nextPage = page + 1;
          searchBooks(searchTerm, nextPage);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadingMore, loading, hasMore, page, searchTerm, searchBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchBooks(searchTerm, 1);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* 검색 입력 영역 */}
      <Box sx={{ mb: 4, mt: 4 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 책 제목, 저자, 출판사로 검색"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                      borderWidth: '2px',
                    },
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !searchTerm.trim()}
              sx={{
                minWidth: '80px',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                },
              }}
            >
              {loading ? '검색 중...' : '검색'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
          }}
        >
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      {/* 초기 상태 - 검색 버튼을 누르기 전 */}
      {!hasSearched && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            📚
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            검색어를 입력하여 책을 찾아보세요
          </Typography>
        </Box>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(3)].map((_, i) => (
            <LoadingBookCard key={i} />
          ))}
        </Box>
      )}

      {/* 검색 결과 */}
      {hasSearched && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              currentBooks={books}
              showRecommendationReason={false}
            />
          ))}

          {/* 무한 스크롤 로딩 인디케이터 */}
          {hasMore && books.length > 0 && (
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
          )}

          {/* 검색 결과 없음 */}
          {books.length === 0 && hasSearched && !loading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                🔍
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', mb: 1 }}
              >
                검색 결과가 없습니다
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                다른 검색어를 시도해보세요
              </Typography>
            </Box>
          )}

          {/* 모든 결과 로드 완료 */}
          {!hasMore && books.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                모든 검색 결과를 불러왔습니다
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
