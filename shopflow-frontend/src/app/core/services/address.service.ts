import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = 'https://scarecrow-erratic-pessimist.ngrok-free.dev/api/addresses';

  constructor(private http: HttpClient) {}

  getMyAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/my`);
  }
}
