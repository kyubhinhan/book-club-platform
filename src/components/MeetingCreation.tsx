'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import Image from 'next/image';
import { Book } from '@prisma/client';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import DiscussionQuestionItem from './DiscussionQuestionItem';
import { useState, useEffect } from 'react';

// 날짜 포맷팅 함수
// "2025-06-13" 형식으로 반환
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 한 달 후 날짜 반환 함수
const getOneMonthLater = (date: Date): Date => {
  return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
};

// 현재 시간을 "HH:mm" 형식으로 반환
const formatCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

interface MeetingCreationProps {
  book: Book;
}

interface MeetingFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  meetingType: 'online' | 'offline';
  location?: string;
  meetingDay: string;
  meetingTime: string;
  meetingFrequency: string;
}

export default function MeetingCreation({ book }: MeetingCreationProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const fetchDefaultQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const res = await fetch('/api/discussions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: book.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.discussion.questions || []);
        }
      } catch {
        // ignore
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchDefaultQuestions();
  }, [book.id]);

  const addQuestion = () => {
    if (questionInput.trim().length < 5) {
      setQuestionError('질문은 5자 이상이어야 합니다.');
      return;
    }
    setQuestions([...questions, questionInput.trim()]);
    setQuestionInput('');
    setQuestionError(null);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<MeetingFormData>({
    mode: 'all',
    defaultValues: {
      title: '',
      description: '',
      startDate: formatDate(new Date()),
      endDate: formatDate(getOneMonthLater(new Date())),
      maxParticipants: 2,
      meetingType: 'online',
      meetingDay: 'monday',
      meetingTime: formatCurrentTime(),
      meetingFrequency: 'weekly',
    },
  });

  const onSubmit = async (data: MeetingFormData) => {
    if (questions.length === 0) {
      setQuestionError('최소 1개의 발제 질문을 입력해주세요.');
      return;
    }
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          bookId: book.id,
          questions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const result = await response.json();
      router.push(`/meetings/${result.meeting.id}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <Box className="max-w-[800px] mx-auto p-3 space-y-4">
      {/* 책 정보 섹션 */}
      <Accordion className="shadow-md rounded-xl overflow-hidden">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="book-info-content"
          id="book-info-header"
          className="bg-gray-50"
        >
          <Typography variant="h6" className="flex items-center gap-2">
            📚 책 정보
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="p-0">
          <div className="p-6 bg-white">
            {/* 책 이미지 */}
            <div className="mb-6 mx-auto max-w-[300px]">
              <div className="relative w-full pt-[133%]">
                <Image
                  src={book.imageUrl || '/default-book-cover.jpg'}
                  alt={book.title}
                  fill
                  className="object-cover rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* 책 정보 */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {book.title}
                </h2>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  ✍️ 저자: {book.author}
                </p>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </p>
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 토론 질문 섹션 */}
      <Accordion
        className="shadow-md rounded-xl overflow-hidden"
        defaultExpanded
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="questions-content"
          id="questions-header"
          className="bg-gray-50"
        >
          <Typography variant="h6" className="flex items-center gap-2">
            💡 발제 질문
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="p-4 bg-white">
            {loadingQuestions ? (
              <div className="text-gray-500">기본 발제문을 불러오는 중...</div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <TextField
                    fullWidth
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="새로운 발제 질문을 입력하세요"
                    error={!!questionError}
                    helperText={questionError}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addQuestion();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={addQuestion}
                    disabled={questionInput.trim().length < 5}
                    sx={{ minWidth: 100 }}
                  >
                    추가
                  </Button>
                </div>
                <ul className="space-y-3">
                  {questions.map((question, index) => (
                    <li key={index} className="flex items-center group">
                      <DiscussionQuestionItem
                        question={question}
                        index={index}
                      />
                      <Button
                        onClick={() => removeQuestion(index)}
                        color="error"
                        size="small"
                        sx={{ ml: 1, opacity: 0.7 }}
                      >
                        삭제
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* 모임 생성 폼 */}
      <div className="bg-white shadow-md rounded-xl border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🤝 모임 만들기
          </h2>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <TextField
              fullWidth
              label="모임 제목"
              {...register('title', { required: '모임 제목은 필수입니다' })}
              error={!!errors.title}
              helperText={errors.title?.message}
              placeholder="모임의 제목을 입력해주세요"
            />

            <TextField
              fullWidth
              label="모임 소개"
              multiline
              rows={4}
              {...register('description', {
                required: '모임 소개는 필수입니다',
              })}
              helperText={errors.description?.message}
              error={!!errors.description}
              placeholder="모임에 대해 소개해주세요"
            />

            <div className="flex align-center gap-4">
              <TextField
                fullWidth
                label="시작일"
                type="date"
                {...register('startDate', {
                  required: '시작일을 선택해주세요',
                  validate: (value) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return (
                      new Date(value) >= today ||
                      '시작일은 오늘 이후여야 합니다'
                    );
                  },
                })}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                fullWidth
                label="종료일"
                type="date"
                {...register('endDate', {
                  required: '종료일을 선택해주세요',
                  validate: (value) => {
                    const startDate = watch('startDate');
                    return (
                      new Date(value) >= new Date(startDate) ||
                      '종료일은 시작일 이후여야 합니다'
                    );
                  },
                })}
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>

            <FormControl fullWidth>
              <InputLabel id="meeting-type-label">모임 방식</InputLabel>
              <Controller
                name="meetingType"
                control={control}
                rules={{ required: '모임 방식을 선택해주세요' }}
                render={({ field }) => (
                  <Select
                    labelId="meeting-type-label"
                    label="모임 방식"
                    {...field}
                    error={!!errors.meetingType}
                  >
                    <MenuItem value="online">🖥️ 온라인</MenuItem>
                    <MenuItem value="offline">🏢 오프라인</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="meeting-day-label">모임 요일</InputLabel>
              <Controller
                name="meetingDay"
                control={control}
                rules={{ required: '모임 요일을 선택해주세요' }}
                render={({ field }) => (
                  <Select
                    labelId="meeting-day-label"
                    label="모임 요일"
                    {...field}
                    error={!!errors.meetingDay}
                  >
                    <MenuItem value="monday">월요일</MenuItem>
                    <MenuItem value="tuesday">화요일</MenuItem>
                    <MenuItem value="wednesday">수요일</MenuItem>
                    <MenuItem value="thursday">목요일</MenuItem>
                    <MenuItem value="friday">금요일</MenuItem>
                    <MenuItem value="saturday">토요일</MenuItem>
                    <MenuItem value="sunday">일요일</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            <TextField
              fullWidth
              label="모임 시간"
              type="time"
              {...register('meetingTime', { required: true })}
              error={!!errors.meetingTime}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <FormControl fullWidth>
              <InputLabel id="meeting-frequency-label">모임 빈도</InputLabel>
              <Controller
                name="meetingFrequency"
                control={control}
                rules={{ required: '모임 빈도를 선택해주세요' }}
                render={({ field }) => (
                  <Select
                    labelId="meeting-frequency-label"
                    label="모임 빈도"
                    {...field}
                    error={!!errors.meetingFrequency}
                  >
                    <MenuItem value="weekly">매주</MenuItem>
                    <MenuItem value="biweekly">격주</MenuItem>
                    <MenuItem value="monthly">매월</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            {watch('meetingType') === 'offline' && (
              <TextField
                fullWidth
                label="모임 장소"
                {...register('location', { required: true })}
                error={!!errors.location}
                placeholder="오프라인 모임 장소를 입력해주세요"
              />
            )}

            <TextField
              fullWidth
              label="최대 참여 인원"
              type="number"
              {...register('maxParticipants', {
                required: true,
                min: 2,
                max: 20,
              })}
              slotProps={{ htmlInput: { min: 2, max: 20 } }}
              error={!!errors.maxParticipants}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="bg-primary-600 hover:bg-primary-700 py-3 text-lg"
            >
              모임 생성하기
            </Button>
          </Box>
        </div>
      </div>
    </Box>
  );
}
