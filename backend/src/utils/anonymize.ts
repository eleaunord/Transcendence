import db from '../db/db';

export function generateAnonymousUsername(userId: number): string {
  let username = '';
  let exists = true;

  while (exists) {
    const timestamp = Date.now().toString().slice(-6); // 마지막 6자리
    username = `anonymous_${userId}_${timestamp}`;

    const check = db.prepare(`
      SELECT 1 FROM users WHERE username = ?
    `).get(username);

    exists = !!check; // check가 존재하면 true -> 계속 반복
  }

  return username;
}
