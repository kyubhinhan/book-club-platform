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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import React from 'react';
import { MeetingData, Meeting } from '@/types/meeting';
import { FILE_UPLOAD_CONFIG, fileUploadUtils } from '@/config/fileUpload';

// 날짜 포맷팅 함수
// "2025-06-13" 형식으로 반환
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

interface MeetingEditAndCreationProps {
  book: Book;
  meetingId?: string; // 수정 모드일 때만 전달
}

export default function MeetingEditAndCreation({
  book,
  meetingId,
}: MeetingEditAndCreationProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingMeeting, setLoadingMeeting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const currentDate = new Date();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MeetingData>({
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
      address: '',
      detailedAddress: '',
    },
  });

  // 수정 모드일 때 기존 모임 정보 로드
  useEffect(() => {
    if (meetingId) {
      setIsEditMode(true);
      setLoadingMeeting(true);

      const fetchMeeting = async () => {
        try {
          const response = await fetch(`/api/meetings/${meetingId}`);
          if (response.ok) {
            const data = await response.json();
            const meeting: Meeting = data.meeting;

            // 폼 데이터 설정
            setValue('title', meeting.title);
            setValue('description', meeting.description || '');
            setValue('meetingDate', formatDate(new Date(meeting.meetingDate)));
            setValue('maxParticipants', meeting.maxParticipants);
            setValue('startTime', meeting.startTime);
            setValue('endTime', meeting.endTime);
            setValue('recommendationReason', meeting.recommendationReason);
            setValue('range', meeting.range || '');
            setValue('address', meeting.address);
            setValue('detailedAddress', meeting.detailedAddress || '');

            // 발제문 설정
            if (meeting.discussion) {
              setQuestions(meeting.discussion.questions);
            }
          }
        } catch (error) {
          console.error('Error fetching meeting:', error);
        } finally {
          setLoadingMeeting(false);
        }
      };

      fetchMeeting();
    }
  }, [meetingId, setValue]);

  useEffect(() => {
    const fetchDefaultQuestions = async () => {
      setLoadingQuestions(true);
      try {
        if (isEditMode && questions.length > 0) {
          // 수정 모드이고 이미 질문이 있으면 스킵
          setLoadingQuestions(false);
          return;
        }

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
  }, [book.id, isEditMode, questions.length]);

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
      const formData = new FormData();

      // 기본 데이터 추가
      Object.keys(data).forEach((key) => {
        if (key !== 'attachments' && key !== 'questions') {
          formData.append(key, data[key as keyof MeetingData] as string);
        }
      });

      // 추가 데이터
      formData.append('bookId', book.id);
      formData.append('questions', JSON.stringify(questions));

      if (isEditMode && meetingId) {
        // 수정 모드
        formData.append('meetingId', meetingId);

        const response = await fetch(`/api/meetings/${meetingId}`, {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to update meeting');
        }

        router.push(`/meetings/${meetingId}`);
      } else {
        // 생성 모드
        const meetingResponse = await fetch('/api/meetings/create', {
          method: 'POST',
          body: formData,
        });

        if (!meetingResponse.ok) {
          throw new Error('Failed to create meeting');
        }

        const meetingResult = await meetingResponse.json();
        const newMeetingId = meetingResult.meeting.id;

        // 2. 파일이 있으면 별도로 업로드
        if (attachments.length > 0) {
          const fileFormData = new FormData();
          fileFormData.append('meetingId', newMeetingId);

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

        router.push(`/meetings/${newMeetingId}`);
      }
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  // Daum Postcode 스크립트 로드 (한 번만)
  useEffect(() => {
    if (isScriptLoaded) return;

    const script = document.createElement('script');
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;

    script.onload = () => {
      setIsScriptLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시에만 스크립트 제거
      const existingScript = document.querySelector(
        'script[src*="postcode.v2.js"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [isScriptLoaded]);

  // 주소 검색 다이얼로그 열기
  const openAddressSearch = () => {
    setAddressDialogOpen(true);
  };

  // Daum Postcode 인스턴스 생성 (다이얼로그가 열릴 때마다)
  useEffect(() => {
    if (!addressDialogOpen || !isScriptLoaded) return;

    // 주소 검색 완료 처리
    const handleAddressSelect = (address: string) => {
      setValue('address', address, { shouldValidate: true });
      setAddressDialogOpen(false);
    };

    // DOM이 완전히 렌더링된 후 Postcode 인스턴스 생성
    const timer = setTimeout(() => {
      const container = document.getElementById('daum-postcode-container');

      if (container) {
        // Postcode 인스턴스 생성
        new window.daum.Postcode({
          oncomplete: function (data: {
            address: string;
            extraAddress?: string;
          }) {
            const address = data.address;
            const extraAddress = data.extraAddress;
            const fullAddress = extraAddress
              ? `${address} ${extraAddress}`
              : address;
            handleAddressSelect(fullAddress);
          },
          width: '100%',
          height: '100%',
        }).embed(container);
      }
    }, 100); // 100ms 지연

    return () => {
      clearTimeout(timer);
    };
  }, [addressDialogOpen, isScriptLoaded, setValue]);

  if (loadingQuestions || loadingMeeting) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <Typography variant="h6" color="textSecondary">
          {isEditMode
            ? '모임 정보를 불러오는 중...'
            : '기본 발제문을 불러오는 중...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="max-w-[800px] mx-auto p-3">
      {/* 뒤로가기 버튼 */}
      <Button
        variant="text"
        onClick={() =>
          router.push(
            isEditMode ? `/meetings/${meetingId}` : '/?restoreState=true'
          )
        }
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
        {isEditMode ? '모임 상세로 돌아가기' : '책 목록으로 돌아가기'}
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
        {/* 모임 생성/수정 폼 */}
        <div className="bg-white shadow-md rounded-xl border border-gray-100">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              {isEditMode ? '✏️ 모임 수정하기' : '🤝 모임 만들기'}
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
                label="책 선정 이유"
                multiline
                minRows={3}
                {...register('recommendationReason', {
                  required: '선정 이유는 필수입니다',
                })}
                error={!!errors.recommendationReason}
                helperText={errors.recommendationReason?.message}
                placeholder="이 책을 선정하는 이유를 입력해주세요"
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

              <TextField
                fullWidth
                label="주소"
                {...register('address', { required: '주소는 필수입니다' })}
                error={!!errors.address}
                helperText={errors.address?.message}
                placeholder="주소 검색을 통해 주소를 선택해주세요"
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                  inputLabel: { shrink: true },
                }}
                onClick={openAddressSearch}
                sx={{
                  '& .MuiInputBase-root': {
                    cursor: 'pointer',
                  },
                }}
              />

              {watch('address') && (
                <TextField
                  fullWidth
                  label="상세 주소"
                  {...register('detailedAddress')}
                  placeholder="건물명, 층수, 호수 등을 입력해주세요"
                />
              )}

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
                {isEditMode ? '모임 수정하기' : '모임 생성하기'}
              </Button>
            </Box>
          </div>
        </div>
      </Box>

      {/* 주소 검색 다이얼로그 */}
      <Dialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>주소 검색</DialogTitle>
        <DialogContent>
          <div id="daum-postcode-container" style={{ height: '450px' }}></div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
