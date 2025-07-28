import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { LogOut, MessageSquare } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/features/user/userSlice";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  userName: string;
  userAvatar?: string;
};

export const Navbar = ({ userName, userAvatar }: NavbarProps) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };
  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
        <MessageSquare className="h-6 w-6 text-primary" />
          <span className="font-bold">ChatsPeCharcha</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="hidden text-sm font-medium sm:inline-flex">
              {userName}
            </span>
            <Avatar className="h-8 w-8">
              {userAvatar ? (
                <AvatarImage src={userAvatar} alt={userName} />
              ) : (
                <AvatarFallback className="text-xs">
                  {getInitials(userName)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
