import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import useMutation from "@/hooks/useMutation";
import useQuery from "@/hooks/useQuery";
import { useSelector, useDispatch } from "react-redux";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "./Sidebar";
import { MainChatArea } from "./MainChatArea";
import { Chat, FriendRequest, Message } from "./types";
import { setUser } from "@/redux/features/user/userSlice";
import { connectSocket, sendMessage as sendSocketMessage } from "@/redux/features/socket/socketActions";
import {
  addMessage,
  updateMessageStatus,
  setTypingStatus,
  selectMessages,
  selectIsTyping
} from "@/redux/features/chat/chatSlice";
import {
  API_SEND_REQUEST,
  API_GET_FRIENDS,
  API_GET_FRIEND_REQUESTS,
} from "@/imports/api";

// Messages will be managed by Redux

export function Dashboard() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    _id: string;
    fullName: string;
    profilePic?: string;
  }>>([]);
  const [messageText, setMessageText] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const { toast } = useToast();
  const { mutate } = useMutation();

  // Fetch friends and friend requests
  const {
    data: friendsData,
    loading: loadingFriends,
    error: friendsError,
    refetch: refetchFriends
  } = useQuery(API_GET_FRIENDS);

  const {
    data: requestsData,
    error: requestsError,
    refetch: refetchRequests
  } = useQuery(API_GET_FRIEND_REQUESTS);

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [contacts, setContacts] = useState<Chat[]>([]);
  // Get messages from Redux store
  const messages = useSelector((state: any) => {
    if (!selectedChatId || !user?._id) return [];
    const conversationId = [user._id, selectedChatId].sort().join('_');
    const msgs = selectMessages(state, conversationId) || [];
    console.log('Current messages for conversation', conversationId, ':', msgs);
    return msgs;
  });

  // Get typing status (filter out current user's typing status)
  const isTyping = useSelector((state: any) => {
    if (!selectedChatId || !user?._id) return false;
    return selectIsTyping(state, selectedChatId) && selectedChatId !== user._id;
  });
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get socket reference
  const socket = (window as any).socket;

  // Set up WebSocket event listeners
  useEffect(() => {

    // Handle new friend requests
    const handleNewFriendRequest = (data: any) => {
      toast({
        title: 'New Friend Request',
        description: `${data.senderName} sent you a friend request`,
      });
      refetchRequests();
    };

    // Handle accepted friend requests
    const handleFriendRequestAccepted = (data: any) => {
      toast({
        title: 'Friend Request Accepted',
        description: `${data.friendName} accepted your friend request`,
      });
      refetchFriends();
      refetchRequests();

      // Update user's friends list in Redux
      if (user?._id === data.userId) {
        const updatedUser = {
          ...user,
          friends: [...(user.friends || []), data.friendId]
        };
        dispatch(setUser(updatedUser));
      }
    };

    // Handle new messages
    const handleNewMessage = (message: any) => {
      try {
        console.log('Received new message:', message);

        // Validate required fields
        if (!message || (!message.senderId && !message.sender) || !message.content) {
          console.error('Invalid message format:', message);
          return;
        }

        // Extract sender ID from message (handling different message formats)
        const senderId = message.senderId || (message.sender?._id) || null;
        const receiverId = message.receiverId || user?._id || null;

        if (!senderId || !receiverId) {
          console.error('Missing senderId or receiverId in message:', message);
          return;
        }

        // Create a stable message ID if one doesn't exist
        const messageId = message._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Check if we already have this message in the current conversation
        const conversationId = [senderId, receiverId].sort().join('_');
        const existingMessages = messages.filter(
          m => (m.senderId === senderId && m.receiverId === receiverId) ||
            (m.senderId === receiverId && m.receiverId === senderId)
        );

        const isDuplicate = existingMessages.some(
          m => (m._id === messageId) ||
            (m.content === message.content &&
              m.senderId === senderId &&
              Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp || Date.now()).getTime()) < 10000)
        );

        if (isDuplicate) {
          console.log('Skipping duplicate message:', messageId, message.content);
          return;
        }

        // Add message to Redux store
        const messageToAdd = {
          ...message,
          _id: messageId,
          senderId,
          receiverId,
          content: message.content,
          timestamp: message.timestamp || new Date().toISOString(),
          status: 'delivered',
          isRead: false
        };

        console.log('Dispatching addMessage with:', messageToAdd);
        dispatch(addMessage(messageToAdd));

        // Show notification for new messages not in the current chat
        // const isMessageFromCurrentChat = selectedChatId === senderId;
        // const isMessageFromCurrentUser = senderId === user?._id;

        // if (!isMessageFromCurrentChat && !isMessageFromCurrentUser) {
        //   const sender = contacts.find(c => c._id === senderId);
        //   if (sender) {
        //     toast({
        //       title: `New message from ${sender.fullName}`,
        //       description: message.content.length > 30
        //         ? `${message.content.substring(0, 30)}...`
        //         : message.content,
        //     });
        //   }
        // }
      } catch (error) {
        console.error('Error handling new message:', error, message);
      }
    };

    // Subscribe to WebSocket events
    const socket = (window as any).socket;
    if (socket) {
      // Listen for new messages
      socket.on("receiveMessage", handleNewMessage);

      // Listen for message status updates
      socket.on('messageStatus', (data: { messageId: string; status: string }) => {
        dispatch(updateMessageStatus({
          messageId: data.messageId,
          status: data.status
        }));
      });
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('newMessage', handleNewMessage);
        socket.off('typing');
        socket.off('messageStatus');
      }
    };
  }, [user, selectedChatId, contacts, refetchFriends, refetchRequests, dispatch, toast]);

  // Connect to socket when component mounts
  useEffect(() => {
    dispatch(connectSocket());

    return () => {
      // Cleanup on unmount if needed
    };
  }, [dispatch]);

  // Handle search text changes
  const handleSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
    
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Filter contacts based on search text
    const filtered = contacts.filter(contact => 
      contact.fullName.toLowerCase().includes(text.toLowerCase())
    );
    
    setSearchResults(filtered);
  }, [contacts]);

  // Update contacts when friends data changes
  useEffect(() => {
    if (friendsData?.success && Array.isArray(friendsData.data)) {
      const updatedContacts = friendsData.data.map((friend: any) => ({
        _id: friend._id,
        fullName: friend.fullName,
        profilePic: friend.profilePic,
        lastMessage: friend.lastMessage?.content || "",
        unreadCount: friend.unreadCount || 0,
        online: friend.online || false,
        timestamp: friend.lastMessage?.timestamp ?
          new Date(friend.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
          "",
        updatedAt: friend.updatedAt || friend.lastMessage?.timestamp || new Date().toISOString()
      }));

      setContacts(updatedContacts);

      // If search is active, update search results
      if (searchText.trim() !== '') {
        const filtered = updatedContacts.filter(contact => 
          contact.fullName.toLowerCase().includes(searchText.toLowerCase())
        );
        setSearchResults(filtered);
      }

      // Auto-select the first chat if none is selected
      if (friendsData.data.length > 0 && !selectedChatId) {
        setSelectedChatId(friendsData.data[0]._id);
      }
    }
  }, [friendsData, selectedChatId, dispatch, searchText]);

  // Update friend requests when requests data changes
  useEffect(() => {
    if (requestsData?.success && Array.isArray(requestsData.data?.data)) {
      setFriendRequests(requestsData.data.data);
    }
  }, [requestsData]);

  // Handle sending a friend request
  const handleSendRequest = async (emailOrId: string) => {
    console.log(emailOrId, "emailOrId");

    // if (!emailOrId.trim()) return;

    setIsSearching(true);
    try {
      const response = await mutate({
        method: "POST",
        url: API_SEND_REQUEST,
        data: {
          recipientEmail: emailOrId,
        },
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Friend request sent successfully"
        });
        setSearchResults([]);
        setIsSendDialogOpen(false);
      } else {
        throw new Error(response.message || "Failed to send friend request");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChatId || !user?._id) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const conversationId = [user._id, selectedChatId].sort().join('_');
    const newMessage = {
      _id: tempId,
      content: messageText,
      senderId: user._id,
      receiverId: selectedChatId,
      timestamp: new Date().toISOString(),
      status: 'sending',
      isRead: false,
      tempId: true
    };

    try {
      console.log('Optimistically adding message:', newMessage);

      // Add message directly to Redux store for immediate UI update
      dispatch(addMessage({
        conversationId,
        message: newMessage
      }));

      // Clear input immediately for better UX
      const messageToSend = messageText;
      setMessageText("");

      // Get socket instance
      const socket = (window as any).socket;
      if (!socket) {
        throw new Error('Not connected to chat server');
      }

      // Emit message directly through socket
      socket.emit('sendMessage', {
        senderId: user._id,
        receiverId: selectedChatId,
        message: messageToSend,
        tempId
      }, (response: any) => {
        console.log('Message sent callback:', response);
        if (response?.success) {
          // The message will be updated via the messageSent event
          console.log('Message sent successfully');
        } else {
          // Update message status to failed
          dispatch(updateMessageStatus({
            messageId: tempId,
            status: 'failed'
          }));

          toast({
            title: 'Error',
            description: response?.error || 'Failed to send message',
            variant: 'destructive',
          });
        }
      });

      // Reset typing status
      handleTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);

      // Update message status to failed
      dispatch(updateMessageStatus({
        messageId: tempId,
        status: 'failed'
      }));

      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!selectedChatId || !socket) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Only emit typing event if we're actually typing
    if (isTyping) {
      // Emit typing start event
      socket.emit('typing', {
        receiverId: selectedChatId,
        isTyping: true
      });

      // Set a timeout to stop the typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (socket.connected) {
          console.log('Auto-stopping typing indicator after inactivity');
          socket.emit('typing', {
            receiverId: selectedChatId,
            isTyping: false
          });
        }
      }, 2000);
    } else if (socket.connected) {
      // Immediately emit typing stop event
      console.log('Emitting typing stop event');
      socket.emit('typing', {
        receiverId: selectedChatId,
        isTyping: false
      });
    }
  }, [selectedChatId, socket]);

  // Handle key press in message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key !== "Enter") {
      // User is typing
      if (!isTyping) {
        handleTyping(true);
      }
    }
  };

  // Handle input blur (user stopped typing)
  const handleInputBlur = () => {
    handleTyping(false);
  };

  // Handle friend request action completion
  const handleRequestActionComplete = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req._id !== requestId));
    refetchRequests();
    refetchFriends();
    setIsRequestsOpen(false);
  };

  // Get typing status from Redux
  const isOtherUserTyping = useSelector((state: any) => {
    if (!selectedChatId) return false;
    return state.chat.typingUsers[selectedChatId] === true;
  });

  // Only show typing indicator if someone else is typing
  const displayTyping = isOtherUserTyping;

  // Get the currently selected chat
  const currentChat = contacts.find(chat => chat._id === selectedChatId) || null;
  console.log(currentChat, "currentChat");

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* <Navbar
        userName={user?.fullName || 'User'}
        userAvatar={user?.profilePic}
      /> */}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          chats={searchText ? searchResults : contacts}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
          isLoading={loadingFriends}
          friendRequests={friendRequests}
          onRequestActionComplete={handleRequestActionComplete}
          onSendRequest={handleSendRequest}
          isSearching={isSearching}
          searchResults={searchResults}
          searchText={searchText}
          onSearchTextChange={handleSearchTextChange}
          isSendDialogOpen={isSendDialogOpen}
          setIsSendDialogOpen={setIsSendDialogOpen}
          isRequestsOpen={isRequestsOpen}
          setIsRequestsOpen={setIsRequestsOpen}
        />

        <MainChatArea
          currentChat={currentChat}
          currentUser={user}
          messages={messages}
          messageText={messageText}
          onMessageChange={setMessageText}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          onInputBlur={handleInputBlur}
          isTyping={displayTyping}
          onTypingChange={setLocalIsTyping}
        />
      </div>
    </div>
  );
}

export default Dashboard;
