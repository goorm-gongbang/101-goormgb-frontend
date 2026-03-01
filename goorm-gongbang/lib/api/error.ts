/* ===========================
   API Error Class
   - 백엔드 에러 응답을 일관되게 처리
=========================== */

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
