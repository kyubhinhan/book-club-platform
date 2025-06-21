'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Book } from '@prisma/client';
import {
  TextField,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import React from 'react';
import { MeetingData } from '@/types/meeting';
import { FILE_UPLOAD_CONFIG, fileUploadUtils } from '@/config/fileUpload';

// 날짜 포맷팅 함수
// "2025-06-13" 형식으로 반환
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 현재 시간을 "HH:mm" 형식으로 반환
const formatCurrentTime = (date: Date): string => {
  const now = date;
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getTwoHourLater = (date: Date): Date => {
  return new Date(date.getTime() + 2 * 60 * 60 * 1000);
};

interface MeetingCreationProps {
  book: Book;
}

export default function MeetingCreation({ book }: MeetingCreationProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const addQuestionCore = () => {
    if (questionInput.trim().length < 5) {
      setQuestionError('질문은 5자 이상이어야 합니다.');
      return;
    }
    setQuestions([...questions, questionInput.trim()]);
    setQuestionInput('');
    setQuestionError(null);
  };
  const addQuestion = useDebounce(addQuestionCore, 100);

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const currentDate = new Date();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MeetingData>({
    mode: 'all',
    defaultValues: {
      title: '',
      description: '',
      meetingDate: formatDate(currentDate),
      maxParticipants: 2,
      startTime: formatCurrentTime(currentDate),
      endTime: formatCurrentTime(getTwoHourLater(currentDate)),
      recommendationReason: book.recommendationReason || '',
      range: '',
      attachments: [],
      bookId: book.id,
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      if (!fileUploadUtils.isValidFileSize(file.size)) {
        alert(
          `${file.name} 파일이 너무 큽니다. (최대 ${fileUploadUtils.formatFileSize(FILE_UPLOAD_CONFIG.MAX_FILE_SIZE)}MB)`
        );
        return false;
      }
      if (!fileUploadUtils.isValidMimeType(file.type)) {
        alert(`${file.name} 파일 형식이 지원되지 않습니다.`);
        return false;
      }
      return true;
    });
    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: MeetingData) => {
    if (questions.length === 0) {
      setQuestionError('최소 1개의 발제 질문을 입력해주세요.');
      return;
    }
    try {
      // 1. 모임 생성 (파일 없이)
      const meetingFormData = new FormData();

      // 기본 데이터 추가
      Object.keys(data).forEach((key) => {
        if (key !== 'attachments' && key !== 'questions') {
          meetingFormData.append(key, data[key as keyof MeetingData] as string);
        }
      });

      // 추가 데이터
      meetingFormData.append('bookId', book.id);
      meetingFormData.append('questions', JSON.stringify(questions));

      const meetingResponse = await fetch('/api/meetings/create', {
        method: 'POST',
        body: meetingFormData,
      });

      if (!meetingResponse.ok) {
        throw new Error('Failed to create meeting');
      }

      const meetingResult = await meetingResponse.json();
      const meetingId = meetingResult.meeting.id;

      // 2. 파일이 있으면 별도로 업로드
      if (attachments.length > 0) {
        const fileFormData = new FormData();
        fileFormData.append('meetingId', meetingId);

        attachments.forEach((file) => {
          fileFormData.append('files', file);
        });

        const fileResponse = await fetch('/api/attachments/upload', {
          method: 'POST',
          body: fileFormData,
        });

        if (!fileResponse.ok) {
          console.warn('File upload failed, but meeting was created');
        }
      }

      router.push(`/meetings/${meetingId}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  if (loadingQuestions) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <Typography variant="h6" color="textSecondary">
          기본 발제문을 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="max-w-[800px] mx-auto p-3">
      {/* 뒤로가기 버튼 */}
      <Button
        variant="text"
        onClick={() => router.push('/?restoreState=true')}
        className="flex items-center gap-1"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        책 목록으로 돌아가기
      </Button>
      <Box className="space-y-4">
        {/* 책 정보 섹션 - Accordion */}
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
            <div className="flex gap-8 bg-white h-[350px]">
              {/* 책 이미지 */}
              <div className="w-1/3 flex-shrink-0">
                <Image
                  src={book.imageUrl || '/images/default-book-cover.jpg'}
                  alt={book.title}
                  width={240}
                  height={320}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
              </div>
              {/* 책 정보 */}
              <div className="w-2/3 flex flex-col h-full overflow-hidden">
                {/* 제목, 저자, 링크 */}
                <div className="mb-4 flex-shrink-0">
                  <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {book.title}
                  </h2>
                  <p className="text-lg text-gray-600 mt-2 truncate">
                    저자: {book.author}
                  </p>
                  {book.link && (
                    <a
                      href={book.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 text-primary-600 hover:underline text-sm font-medium"
                    >
                      상세 정보 보기 ↗
                    </a>
                  )}
                </div>
                {/* 설명(줄거리) - 스크롤 */}
                <div className="flex-1 overflow-y-auto pr-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
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
          <AccordionDetails className="p-0">
            <div
              className={`flex gap-2 ${questionError == null ? 'mb-4' : ''}`}
            >
              <TextField
                fullWidth
                value={questionInput}
                onChange={(e) => {
                  setQuestionInput(e.target.value);
                  setQuestionError(null);
                }}
                placeholder="새로운 발제 질문을 입력하세요"
                error={!!questionError}
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
            {questionError && (
              <p className="text-red-500 text-sm mb-4">{questionError}</p>
            )}
            <ul className="space-y-3">
              {questions.map((question, index) => (
                <li key={index} className="flex items-center group">
                  <div className="flex-1 flex items-center p-4 bg-primary-50 rounded-lg group">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-primary-600 text-white rounded-full mr-3 text-base">
                      {index + 1}
                    </span>
                    <p className="text-gray-800 text-base leading-relaxed flex-1">
                      {question}
                    </p>
                    <Button
                      onClick={() => removeQuestion(index)}
                      color="error"
                      size="small"
                      sx={{ ml: 1, opacity: 0.7 }}
                    >
                      삭제
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
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

              <TextField
                fullWidth
                label="책 추천 이유"
                multiline
                minRows={3}
                {...register('recommendationReason', {
                  required: '추천 이유는 필수입니다',
                })}
                error={!!errors.recommendationReason}
                helperText={errors.recommendationReason?.message}
                placeholder="이 책을 추천하는 이유를 입력해주세요"
              />

              <TextField
                fullWidth
                label="책 범위"
                {...register('range')}
                error={!!errors.range}
                helperText={errors.range?.message}
                placeholder="책 범위를 입력해주세요"
              />

              <TextField
                fullWidth
                label="모임일"
                type="date"
                {...register('meetingDate', {
                  required: '모임일을 선택해주세요',
                  validate: (value) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return (
                      new Date(value) >= today ||
                      '모임일은 오늘 이후여야 합니다'
                    );
                  },
                })}
                error={!!errors.meetingDate}
                helperText={errors.meetingDate?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <div className="flex gap-4">
                <TextField
                  fullWidth
                  label="시작 시간"
                  type="time"
                  {...register('startTime', { required: true })}
                  error={!!errors.startTime}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  fullWidth
                  label="종료 시간"
                  type="time"
                  {...register('endTime', {
                    required: true,
                    validate: (value) => {
                      const startTime = watch('startTime');
                      return (
                        value >= startTime ||
                        '종료 시간은 시작 시간 이후여야 합니다'
                      );
                    },
                  })}
                  error={!!errors.endTime}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </div>

              <TextField
                fullWidth
                label="모임 장소"
                {...register('location', { required: true })}
                error={!!errors.location}
                placeholder="오프라인 모임 장소를 입력해주세요"
              />

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

              {/* 파일 업로드 섹션 */}
              <div>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  참고 자료
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.map(
                    (ext) => `.${ext}`
                  ).join(',')}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleFileButtonClick}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                  }}
                >
                  파일 선택하기
                </Button>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {FILE_UPLOAD_CONFIG.FILE_TYPE_DESCRIPTION}
                </Typography>

                {attachments.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">
                            {file.name} (
                            {fileUploadUtils.formatFileSize(file.size)}MB)
                          </span>
                        </div>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeAttachment(index)}
                        >
                          삭제
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={Object.keys(errors).length > 0}
                className="bg-primary-600 hover:bg-primary-700 py-3 text-lg"
              >
                모임 생성하기
              </Button>
            </Box>
          </div>
        </div>
      </Box>
    </Box>
  );
}
