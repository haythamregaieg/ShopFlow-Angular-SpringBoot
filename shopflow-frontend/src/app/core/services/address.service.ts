import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = 'http://localhost:8081/api/addresses';

  constructor(private http: HttpClient) {}

  getMyAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/my`);
  }
}
