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
  Paper,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

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
    <Box sx={{ maxWidth: '3xl', mx: 'auto', p: 4, '& > *': { mb: 6 } }}>
      {/* 책 정보 섹션 */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="book-info-content"
          id="book-info-header"
        >
          <Typography variant="h6">책 정보</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
            <Box
              sx={{
                flexShrink: 0,
                width: 200,
                height: 300,
                position: 'relative',
              }}
            >
              <Image
                src={book.imageUrl || '/default-book-cover.jpg'}
                alt={book.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>
            <Box>
              <Typography variant="h5" gutterBottom>
                {book.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                저자: {book.author}
              </Typography>
              <Typography variant="body2">{book.description}</Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 토론 질문 섹션 */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="questions-content"
          id="questions-header"
        >
          <Typography variant="h6">토론 질문</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="ul" sx={{ pl: 2 }}>
            {discussionQuestions.map((question, index) => (
              <Typography component="li" key={index} sx={{ mb: 2 }}>
                {question}
              </Typography>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 모임 생성 폼 */}
      <Paper sx={{ p: 6 }}>
        <Typography variant="h5" gutterBottom>
          모임 만들기
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ '& > *': { mb: 3 } }}
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
            rows={5}
            {...register('description', { required: true })}
            error={!!errors.description}
            placeholder="모임에 대해 소개해주세요"
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              fullWidth
              label="시작일"
              type="date"
              {...register('startDate', { required: true })}
              error={!!errors.startDate}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="종료일"
              type="date"
              name={register('endDate', { required: true }).name}
              onChange={register('endDate', { required: true }).onChange}
              onBlur={register('endDate', { required: true }).onBlur}
              inputRef={register('endDate', { required: true }).ref}
              error={!!errors.endDate}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel id="meeting-type-label">모임 방식</InputLabel>
            <Select
              labelId="meeting-type-label"
              label="모임 방식"
              defaultValue=""
              {...register('meetingType', { required: true })}
              error={!!errors.meetingType}
            >
              <MenuItem value="online">온라인</MenuItem>
              <MenuItem value="offline">오프라인</MenuItem>
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
            InputLabelProps={{ shrink: true }}
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
            error={!!errors.maxParticipants}
            inputProps={{ min: 2, max: 20 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
          >
            모임 만들기
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
