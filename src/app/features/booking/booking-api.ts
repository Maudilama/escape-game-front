import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../core/api-url';
import { Booking, CreateBookingRequest } from './booking.model';

@Injectable({ providedIn: 'root' })
export class BookingApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  create(request: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, request);
  }

  cancel(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/bookings/${id}/cancel`, null);
  }
}