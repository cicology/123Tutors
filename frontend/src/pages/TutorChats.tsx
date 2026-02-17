import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const TutorChats = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("studentId");
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (studentId) {
      handleChatWithStudent(studentId);
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      const interval = setInterval(() => fetchMessages(selectedChat.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const response = await apiService.getChats();
      if (response.error) {
        toast.error(response.error);
        return;
      }
      if (response.data) {
        setChats(response.data);
        if (response.data.length > 0 && !selectedChat) {
          setSelectedChat(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithStudent = async (studentId: string) => {
    try {
      const response = await apiService.getOrCreateChat(studentId);
      if (response.data) {
        setSelectedChat(response.data);
        await fetchChats(); // Refresh chats list
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to open chat");
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await apiService.getChat(chatId);
      if (response.data) {
        setSelectedChat(response.data);
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat) return;

    try {
      const response = await apiService.sendMessage({
        chatId: selectedChat.id,
        content: messageText,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      setMessageText("");
      fetchMessages(selectedChat.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="h-96"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-gradient">123tutors</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tutor-dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Chat with your students</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
          {/* Chats List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-0">
              <div className="h-full overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                          selectedChat?.id === chat.id ? "bg-secondary" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-accent/20 text-accent">
                              {getInitials(
                                chat.student?.firstName || "",
                                chat.student?.lastName || ""
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {chat.student?.firstName} {chat.student?.lastName}
                            </p>
                            {chat.messages && chat.messages.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {chat.messages[chat.messages.length - 1]?.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-3 flex flex-col">
            {selectedChat ? (
              <>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === "tutor" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderType === "tutor"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {format(new Date(message.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>
                <form onSubmit={sendMessage} className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" variant="accent">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TutorChats;

