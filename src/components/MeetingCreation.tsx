'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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

interface MeetingCreationProps {
  book: Book;
  discussionQuestions: string[];
  discussionId: string;
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

export default function MeetingCreation({
  book,
  discussionQuestions,
  discussionId,
}: MeetingCreationProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MeetingFormData>();

  const onSubmit = async (data: MeetingFormData) => {
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          bookId: book.id,
          discussionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const result = await response.json();
      router.push(`/meetings/${result.id}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <Box className="max-w-[800px] mx-auto p-3 space-y-4">
      {/* 책 정보 섹션 */}
      <Accordion
        defaultExpanded
        className="shadow-md rounded-xl overflow-hidden"
      >
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
        defaultExpanded
        className="shadow-md rounded-xl overflow-hidden"
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
            <ul className="space-y-3">
              {discussionQuestions.map((question, index) => (
                <DiscussionQuestionItem
                  key={index}
                  question={question}
                  index={index}
                />
              ))}
            </ul>
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
              {...register('description', { required: true })}
              error={!!errors.description}
              placeholder="모임에 대해 소개해주세요"
            />

            <div className="flex align-center gap-4">
              <TextField
                fullWidth
                label="시작일"
                type="date"
                {...register('startDate', { required: true })}
                error={!!errors.startDate}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                fullWidth
                label="종료일"
                type="date"
                {...register('endDate', { required: true })}
                error={!!errors.endDate}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>

            <FormControl fullWidth>
              <InputLabel id="meeting-type-label">모임 방식</InputLabel>
              <Select
                labelId="meeting-type-label"
                label="모임 방식"
                defaultValue=""
                {...register('meetingType', { required: true })}
                error={!!errors.meetingType}
              >
                <MenuItem value="online">🖥️ 온라인</MenuItem>
                <MenuItem value="offline">🏢 오프라인</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="meeting-day-label">모임 요일</InputLabel>
              <Select
                labelId="meeting-day-label"
                label="모임 요일"
                defaultValue=""
                {...register('meetingDay', { required: true })}
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
              <Select
                labelId="meeting-frequency-label"
                label="모임 빈도"
                defaultValue=""
                {...register('meetingFrequency', { required: true })}
                error={!!errors.meetingFrequency}
              >
                <MenuItem value="weekly">매주</MenuItem>
                <MenuItem value="biweekly">격주</MenuItem>
                <MenuItem value="monthly">매월</MenuItem>
              </Select>
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
