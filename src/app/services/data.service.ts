import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  private headers = new Headers({ 'Content-Type': 'application/json', 'charset': 'UTF-8' });
  private options = new RequestOptions({ headers: this.headers });

  constructor(private http: Http) { }

  getFiles(): Observable<any> {
    return this.http.get('/my-files').map(res => res.json());
  }

  getData(): Observable<any> {
    return this.http.get(`/my-transactions/`).map(res => res.json());
  }

  addCat(cat): Observable<any> {
    return this.http.post(`/upload/file`, JSON.stringify(cat), this.options);
  }

  editCat(cat): Observable<any> {
    return this.http.put(`/cat/${cat._id}`, JSON.stringify(cat), this.options);
  }

  deleteCat(cat): Observable<any> {
    return this.http.delete(`/cat/${cat._id}`, this.options);
  }

}
