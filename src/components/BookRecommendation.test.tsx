import { render, screen, fireEvent } from '@testing-library/react';
import BookRecommendation from './BookRecommendation';

describe('BookRecommendation', () => {
  it('renders the component', () => {
    render(<BookRecommendation />);
    expect(screen.getByText('AI 도서 추천')).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    render(<BookRecommendation />);
    const submitButton = screen.getByRole('button', { name: '추천 받기' });

    fireEvent.click(submitButton);
    expect(screen.getByText('추천 중...')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

    render(<BookRecommendation />);
    const submitButton = screen.getByRole('button', { name: '추천 받기' });

    fireEvent.click(submitButton);
    expect(await screen.findByText('API Error')).toBeInTheDocument();
  });
});
