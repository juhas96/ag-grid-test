import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import type { TableRequest, TableResponse } from '../../shared/table';

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly department: string;
  readonly createdAt: string;
}

export interface UserFilter {
  readonly role?: string[];
  readonly department?: string[];
}

const ROLES = ['Admin', 'Editor', 'Viewer'] as const;
const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR'] as const;
const FIRST_NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Hank',
  'Ivy',
  'Jack',
  'Karen',
  'Leo',
  'Mia',
  'Noah',
  'Olivia',
  'Paul',
  'Quinn',
  'Ruby',
  'Sam',
  'Tina',
  'Uma',
  'Victor',
  'Wendy',
  'Xander',
] as const;
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
] as const;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateUsers(count = 10_000): User[] {
  const random = seededRandom(123);
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const name = `${first} ${last}`;
    const year = 2020 + Math.floor(random() * 5);
    const month = String(Math.floor(random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(random() * 28) + 1).padStart(2, '0');

    users.push({
      id: i + 1,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      role: ROLES[Math.floor(random() * ROLES.length)],
      department: DEPARTMENTS[Math.floor(random() * DEPARTMENTS.length)],
      createdAt: `${year}-${month}-${day}`,
    });
  }

  return users;
}

const ALL_USERS: readonly User[] = generateUsers();

@Injectable({ providedIn: 'root' })
export class MockApiService {
  getUsers(request: TableRequest<UserFilter>): Observable<TableResponse<User>> {
    let filtered = [...ALL_USERS];

    // Apply role filter
    const roles = request.filter.role;
    if (roles && roles.length > 0) {
      filtered = filtered.filter((u) => roles.includes(u.role));
    }

    // Apply department filter
    const departments = request.filter.department;
    if (departments && departments.length > 0) {
      filtered = filtered.filter((u) => departments.includes(u.department));
    }

    // Apply search
    if (request.search) {
      const q = request.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q),
      );
    }

    // Apply sort
    if (request.sort) {
      const { colId, direction } = request.sort;
      const dir = direction === 'asc' ? 1 : -1;
      filtered.sort((a, b) => {
        const aVal = String((a as unknown as Record<string, unknown>)[colId] ?? '');
        const bVal = String((b as unknown as Record<string, unknown>)[colId] ?? '');
        return aVal.localeCompare(bVal) * dir;
      });
    }

    // Apply pagination
    const startIndex = request.page.index * request.page.size;
    const page = filtered.slice(startIndex, startIndex + request.page.size);

    console.log(
      `[MockAPI] page=${request.page.index} rows=${startIndex}-${startIndex + page.length}` +
        ` of ${filtered.length} | returned=${page.length}` +
        (request.search ? ` search="${request.search}"` : '') +
        (request.sort ? ` sort=${request.sort.colId}:${request.sort.direction}` : ''),
    );

    return of<TableResponse<User>>({
      data: page,
      totalCount: filtered.length,
      unfilteredTotalCount: ALL_USERS.length,
    }).pipe(delay(500));
  }
}
