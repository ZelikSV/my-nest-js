export class HttpException extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpException);
    }
  }

  getResponse(): { statusCode: number; message: string; error: string } {
    return {
      statusCode: this.status,
      message: this.message,
      error: this.name,
    };
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request') {
    super(400, message);
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenException';
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found') {
    super(404, message);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super(409, message);
    this.name = 'ConflictException';
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Internal Server Error') {
    super(500, message);
    this.name = 'InternalServerErrorException';
  }
}
