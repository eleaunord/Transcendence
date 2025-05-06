
export function generate2FACode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 숫자
  }
