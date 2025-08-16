// 클라이언트 사이드에서 사용할 수 있는 파일 업로드 설정
export const CLIENT_FILE_UPLOAD_CONFIG = {
  // 최대 파일 크기 (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // 허용된 파일 형식
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ] as const,

  // 허용된 파일 확장자
  ALLOWED_EXTENSIONS: [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'svg',
  ] as const,

  // 파일 형식별 설명
  FILE_TYPE_DESCRIPTION: 'PDF, DOC, XLS, PPT, TXT, 이미지 파일 (최대 10MB)',
} as const;

// 타입 정의
export type AllowedMimeType =
  (typeof CLIENT_FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES)[number];
export type AllowedExtension =
  (typeof CLIENT_FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS)[number];

// MIME 타입 매핑 함수
export const getMimeType = (
  filename: string,
  storedMimeType?: string
): string => {
  // 저장된 MIME 타입이 있으면 우선 사용
  if (storedMimeType) {
    return storedMimeType;
  }

  // 파일 확장자 기반 MIME 타입 매핑
  const extension = filename.toLowerCase().split('.').pop();

  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'txt':
      return 'text/plain';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
};

// 클라이언트 사이드 파일 업로드 유틸리티 함수들
export const clientFileUploadUtils = {
  // 파일 크기 검증
  isValidFileSize: (fileSize: number): boolean => {
    return fileSize <= CLIENT_FILE_UPLOAD_CONFIG.MAX_FILE_SIZE;
  },

  // MIME 타입 검증
  isValidMimeType: (mimeType: string): boolean => {
    return CLIENT_FILE_UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(
      mimeType as AllowedMimeType
    );
  },

  // 파일 확장자 검증
  isValidExtension: (filename: string): boolean => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension
      ? CLIENT_FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(
          extension as AllowedExtension
        )
      : false;
  },

  // 파일 검증 (크기 + 형식)
  isValidFile: (file: File): boolean => {
    return (
      clientFileUploadUtils.isValidFileSize(file.size) &&
      clientFileUploadUtils.isValidMimeType(file.type)
    );
  },

  // 파일 크기를 MB로 변환
  formatFileSize: (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(2);
  },
};
