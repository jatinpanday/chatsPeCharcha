// Define the User type
export interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

// Define the user slice state
export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Root state of the Redux store
export interface RootState {
  user: UserState;
}
