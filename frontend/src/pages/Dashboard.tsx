
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Settings, 
  LogOut,
  MoreVertical,
  Phone,
  Video
} from "lucide-react";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  online?: boolean;
}

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  sender?: string;
}

const Dashboard = () => {
  const [selectedChat, setSelectedChat] = useState<string>("1");
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");

  const chats: Chat[] = [
    {
      id: "1",
      name: "Alice Johnson",
      lastMessage: "Hey! How are you doing?",
      timestamp: "2 min ago",
      unread: 2,
      online: true
    },
    {
      id: "2",
      name: "Team Design",
      lastMessage: "The new mockups look great!",
      timestamp: "1h ago",
      unread: 0,
    },
    {
      id: "3",
      name: "Bob Smith",
      lastMessage: "Let's catch up tomorrow",
      timestamp: "3h ago",
      unread: 1,
      online: true
    },
    {
      id: "4",
      name: "Project Alpha",
      lastMessage: "Meeting at 3 PM today",
      timestamp: "1d ago",
      unread: 0,
    },
    {
      id: "5",
      name: "Sarah Wilson",
      lastMessage: "Thanks for your help!",
      timestamp: "2d ago",
      unread: 0,
    }
  ];

  const messages: Message[] = [
    {
      id: "1",
      text: "Hey! How are you doing?",
      timestamp: "10:30 AM",
      isSent: false,
      sender: "Alice"
    },
    {
      id: "2",
      text: "I'm doing great, thanks! Just working on some new features for the app.",
      timestamp: "10:32 AM",
      isSent: true
    },
    {
      id: "3",
      text: "That sounds exciting! Can't wait to see what you've been building.",
      timestamp: "10:33 AM",
      isSent: false,
      sender: "Alice"
    },
    {
      id: "4",
      text: "I'll share some screenshots with you later today. The new chat interface is looking really smooth!",
      timestamp: "10:35 AM",
      isSent: true
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, you would send the message here
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const currentChat = chats.find(chat => chat.id === selectedChat);

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Chats</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChats.map((chat) => (
              <Card
                key={chat.id}
                className={`p-3 mb-2 cursor-pointer transition-[var(--transition-smooth)] hover:shadow-soft ${
                  selectedChat === chat.id ? "bg-accent border-primary" : ""
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {chat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <Badge variant="default" className="ml-2 h-5 min-w-[20px] text-xs">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {currentChat && (
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentChat.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentChat.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {currentChat.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{currentChat.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentChat.online ? "Active now" : "Last seen " + currentChat.timestamp}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isSent ? "justify-end" : "justify-start"} animate-slide-in-left`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-3 ${
                    message.isSent
                      ? "bg-chat-bubble text-chat-bubble-foreground"
                      : "bg-chat-bubble-received text-chat-bubble-received-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-card">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              variant="chat" 
              size="icon"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;