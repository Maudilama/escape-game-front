import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '../api-url';
import { LanguageService } from './language.service';

export const languageInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(inject(API_URL)) || request.headers.has('Accept-Language')) {
    return next(request);
  }
  const language = inject(LanguageService).current();
  return next(request.clone({ setHeaders: { 'Accept-Language': language } }));
};