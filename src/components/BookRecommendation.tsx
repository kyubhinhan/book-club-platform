import { Button, Alert } from '@mui/material';
import { Book, CategoryId } from '@/types/book';
import BookCard from './BookCard';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
}

const categories: Category[] = [
  { id: '소설', name: '소설', emoji: '📚' },
  { id: '비소설', name: '비소설', emoji: '📖' },
  { id: '자기계발', name: '자기계발', emoji: '✨' },
  { id: '경영/경제', name: '경영/경제', emoji: '💼' },
];

interface BookRecommendationProps {
  selectedCategory: CategoryId;
}

async function getBooksByCategory(categoryId: CategoryId): Promise<Book[]> {
  try {
    const books = await prisma.book.findMany({
      where: { category: categoryId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return books.map((book) => ({
      ...book,
      category: book.category as CategoryId,
      pubDate: book.pubDate?.toISOString() || null,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching books by category:', error);
    return [];
  }
}

export default async function BookRecommendation({
  selectedCategory,
}: BookRecommendationProps) {
  const recommendedBooks = await getBooksByCategory(selectedCategory);

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex justify-between items-start mb-6">
        {/* 카테고리 선택 버튼 그룹 */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                style={{ textDecoration: 'none', flex: 1 }}
              >
                <Button
                  variant={
                    selectedCategory === category.id ? 'contained' : 'outlined'
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                    px: 2,
                    fontSize: '0.8rem',
                    fontWeight: selectedCategory === category.id ? 600 : 400,
                    borderRadius: '16px',
                    minWidth: '100px',
                    width: '100%',
                  }}
                >
                  <span>{category.emoji}</span>
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {recommendedBooks.length === 0 && (
        <Alert severity="info" className="mb-4">
          해당 카테고리에 책이 없습니다.
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        {recommendedBooks.map((book) => (
          <BookCard key={book.id} book={book} currentBooks={recommendedBooks} />
        ))}
      </div>
    </div>
  );
}
