import { inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { HttpDatasource } from '../../shared/table';
import type { TableRequest, TableResponse } from '../../shared/table';
import { MockApiService, type User, type UserFilter } from './mock-api.service';

export class ServerTableDatasource extends HttpDatasource<UserFilter, User> {
  private readonly mockApi = inject(MockApiService);

  constructor() {
    super(50); // cacheBlockSize = 50
  }

  fetchData(request: TableRequest<UserFilter>): Observable<TableResponse<User>> {
    return this.mockApi.getUsers(request);
  }
}
