export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}
