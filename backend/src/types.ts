export interface User {
    id: number;
    username: string;
    email: string;
    password_hash?: string;
    image?: string;
    google_id?: string;
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