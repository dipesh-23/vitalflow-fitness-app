import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Utility function to format Markdown text
const formatMarkdown = (text: string): string => {
  // Replace **bold** with <strong>bold</strong>
  const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Replace newlines with <br /> to preserve paragraph spacing
  const withLineBreaks = boldFormatted.replace(/\n/g, "<br />");
  // Remove other Markdown characters like _, *, and `
  return withLineBreaks.replace(/(__|\*|_|`)/g, "");
};

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  rawContent?: string; // Store raw content for database
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-chat`;

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: formatMarkdown(
    "Hi! I'm your **AI health assistant**. I have access to your health data, meals, and activities.\n\nAsk me for dietary advice, health summaries, or any wellness questions!"
  ),
  rawContent:
    "Hi! I'm your **AI health assistant**. I have access to your health data, meals, and activities.\n\nAsk me for dietary advice, health summaries, or any wellness questions!",
};

export function HealthChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from database
  const loadChatHistory = useCallback(async () => {
    if (!user || hasLoadedHistory) return;

    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: formatMarkdown(msg.content),
          rawContent: msg.content,
        }));
        setMessages([INITIAL_MESSAGE, ...loadedMessages]);
      }
      setHasLoadedHistory(true);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, hasLoadedHistory]);

  // Load history when chat opens
  useEffect(() => {
    if (isOpen && user && !hasLoadedHistory) {
      loadChatHistory();
    }
  }, [isOpen, user, hasLoadedHistory, loadChatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Save message to database
  const saveMessage = async (role: "user" | "assistant", content: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          role,
          content,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error("Failed to save message:", error);
      return null;
    }
  };

  // Clear chat history
  const clearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setMessages([INITIAL_MESSAGE]);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error("Failed to clear chat history");
    }
  };

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: userMessages.map((m) => ({ role: m.role, content: m.rawContent || m.content })),
        userId: user?.id,
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1 && !last.id) {
                return prev.map((m, i) =>
                  i === prev.length - 1
                    ? { ...m, content: formatMarkdown(assistantContent), rawContent: assistantContent }
                    : m
                );
              }
              return [...prev, { role: "assistant", content: formatMarkdown(assistantContent), rawContent: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = { role: "user", content: input.trim(), rawContent: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message
      await saveMessage("user", input.trim());

      // Get AI response
      const assistantContent = await streamChat(newMessages.slice(1)); // Skip initial greeting

      // Save assistant message
      if (assistantContent) {
        await saveMessage("assistant", assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Give me a health summary",
    "Dietary advice for my goals",
    "How are my macros?",
    "Suggest a meal plan",
  ];

  const hasHistory = messages.length > 1;

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Health Assistant</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <History className="h-3 w-3" />
                    <span>Chat history saved</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasHistory && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearHistory}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Clear chat history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading chat history...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[280px] text-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      />
                    </motion.div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Quick Prompts */}
              {messages.length === 1 && !isLoadingHistory && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => {
                          setInput(prompt);
                          inputRef.current?.focus();
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your health..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}