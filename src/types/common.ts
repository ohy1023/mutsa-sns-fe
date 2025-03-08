export interface Response<T> {
  resultCode: string;
  result: T;
}

export interface ErrorResult {
  errorCode: string; // 서버에서 제공하는 에러 코드 (예: "USERNAME_NOT_FOUND")
  message: string; // 서버에서 제공하는 에러 메시지 (예: "해당 UserName이 없습니다.")
}

export interface ErrorResponse {
  resultCode: 'ERROR'; // 서버에서 에러 발생 시 "ERROR"로 고정
  result: ErrorResult; // 실제 에러 정보
}

export interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  sort: SortInfo;
  offset: number;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
  paged: boolean;
}

export interface Page<T> {
  content: T[]; // 데이터 목록
  pageable?: Pageable; // 페이지네이션 정보 (선택적)
  number: number; // 현재 페이지 번호
  size: number; // 한 페이지에 포함된 개수
  totalElements: number; // 전체 데이터 개수
  totalPages: number; // 전체 페이지 개수
  last: boolean; // 마지막 페이지 여부
  first?: boolean; // 첫 번째 페이지 여부 (선택적)
  empty?: boolean; // 데이터가 비어있는지 여부 (선택적)
}

export interface Slice<T> {
  content: T[]; // 현재 페이지 데이터 목록
  size: number; // 요청한 페이지 크기
  number: number; // 현재 페이지 번호 (0부터 시작)
  hasNext: boolean; // 다음 페이지 존재 여부
  hasPrevious: boolean; // 이전 페이지 존재 여부
}
