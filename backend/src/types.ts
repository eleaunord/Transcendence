export interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  image?: string;
  theme?: string;
  google_id?: string;
  seen_2fa_prompt: number; // 추가 : 0805 added 2fa
  is_2fa_enabled?: number;
  two_fa_code?: string;
  two_fa_expires_at?: string;
}
// ----- Authentification via Google ------ \\
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface LeaderboardRow {
  id: number;
  username: string;
  total_points: number;
}

export interface FriendRow {
  id: number;           // unique ID of the friend
  username: string;     //  username of the friend
  status: 'online' | 'offline';  // status of the friend (online or offline)
  profile_picture: string; 
}

export interface RecentGame {
  created_at: string;
  opponent_id: number;
}


// interface Game {
//     id: number;
//     user_id: number;
//     opponent_id: number;
//     winner_id?: number;
//     created_at: string;
//   }
// interface Score {
//     id: number;
//     game_id: number;
//     player_id: number;
//     score: number;
//   }
// interface Friend {
//     id: number;
//     user_id: number;
//     friend_id: number;
//     status: string;
//     created_at: string;
//   }   