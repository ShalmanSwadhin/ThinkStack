import AppError from './AppError.js';

export class ComingSoonError extends AppError {
  constructor(service, message) {
    super(message, 200);
    this.name = 'ComingSoonError';
    this.comingSoon = true;
    this.service = service;
  }
}

export default ComingSoonError;
