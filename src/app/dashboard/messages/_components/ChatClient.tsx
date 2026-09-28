"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Search, UserCircle2 } from "lucide-react";
import { sendMessage, markMessagesAsRead } from "../actions";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  roles?: { name: string } | { name: string }[] | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatClientProps {
  currentUser: TeamMember;
  members: TeamMember[];
  initialMessages: Message[];
}

export function ChatClient({ currentUser, members, initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingMembers, setTypingMembers] = useState<Set<string>>(new Set());
  
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeMemberRef = useRef<string | null>(null);
  const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          const newMessage = payload.new as Message;
          // Only add to state if it involves the current user
          if (
            newMessage.sender_id === currentUser.id ||
            newMessage.receiver_id === currentUser.id
          ) {
          const isFromActive =
            newMessage.sender_id === activeMemberRef.current &&
            newMessage.receiver_id === currentUser.id;

          const messageToAdd = isFromActive ? { ...newMessage, is_read: true } : newMessage;

          setMessages((prev) => {
            if (prev.some((m) => m.id === messageToAdd.id)) return prev;

            if (messageToAdd.sender_id === currentUser.id) {
              const optIndex = prev.findIndex(
                (m) => m.id.startsWith("temp-") && m.content === messageToAdd.content
              );
              if (optIndex !== -1) {
                const next = [...prev];
                next[optIndex] = messageToAdd;
                return next;
              }
            }

            return [...prev, messageToAdd];
          });

          // Trigger mark as read side-effect OUTSIDE the setState updater function
          if (isFromActive && activeMemberRef.current) {
            markMessagesAsRead(activeMemberRef.current, currentUser.id).catch(console.error);
          }
        }
      }
    )
    .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload: any) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUser.id]);

  // Presence and Typing Indicators
  useEffect(() => {
    // 1. Presence
    const presenceChannel = supabase.channel('online-users', {
      config: { presence: { key: currentUser.id } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state));
      })
      .subscribe(async (status: any) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    // 2. Typing Broadcasts
    const typingChannel = supabase.channel('typing-room', {
      config: { broadcast: { self: false } },
    });
    
    typingChannelRef.current = typingChannel;

    typingChannel
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        const { sender_id, receiver_id } = payload.payload;
        if (receiver_id === currentUser.id) {
          setTypingMembers((prev) => {
            const next = new Set(prev);
            next.add(sender_id);
            return next;
          });

          if (typingTimeouts.current[sender_id]) {
            clearTimeout(typingTimeouts.current[sender_id]);
          }

          typingTimeouts.current[sender_id] = setTimeout(() => {
            setTypingMembers((prev) => {
              const next = new Set(prev);
              next.delete(sender_id);
              return next;
            });
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [supabase, currentUser.id]);

  // Handle member click (replaces the buggy useEffect)
  const handleSelectMember = (memberId: string) => {
    setActiveMemberId(memberId);
    activeMemberRef.current = memberId;
    markMessagesAsRead(memberId, currentUser.id).catch(console.error);
    
    // Optimistically mark as read in local state
    setMessages((prev) =>
      prev.map((m) =>
        m.sender_id === memberId && m.receiver_id === currentUser.id
          ? { ...m, is_read: true }
          : m
      )
    );
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeMemberId]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (activeMemberId && typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_id: currentUser.id, receiver_id: activeMemberId },
      });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeMemberId) return;

    const content = inputText.trim();
    setInputText(""); // clear input instantly

    // Optimistic UI update
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: activeMemberId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendMessage(currentUser.id, activeMemberId, content);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message if failed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Failed to send message. Please try again.");
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMember = members.find((m) => m.id === activeMemberId);
  const activeMessages = messages.filter(
    (m) =>
      (m.sender_id === currentUser.id && m.receiver_id === activeMemberId) ||
      (m.sender_id === activeMemberId && m.receiver_id === currentUser.id)
  );

  // Helper to count unread messages from a specific user
  const getUnreadCount = (senderId: string) => {
    return messages.filter(
      (m) => m.sender_id === senderId && m.receiver_id === currentUser.id && !m.is_read
    ).length;
  };

  const getMemberRoleName = (member: TeamMember) => {
    if (!member.roles) return "Member";
    if (Array.isArray(member.roles)) {
      return member.roles[0]?.name || "Member";
    }
    return member.roles.name || "Member";
  };

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Sidebar - Users List */}
      <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col h-full shrink-0 min-h-0">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No members found.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const unreadCount = getUnreadCount(member.id);
                const isActive = activeMemberId === member.id;
                
                return (
                  <li key={member.id}>
                    <button
                      onClick={() => handleSelectMember(member.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-slate-100 ${
                        isActive ? "bg-indigo-50 hover:bg-indigo-50" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        {onlineUsers.includes(member.id) && (
                          <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className={`text-sm font-semibold truncate ${isActive ? "text-indigo-900" : "text-slate-900"}`}>
                            {member.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {getMemberRoleName(member)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white h-full min-h-0 min-w-0 ${!activeMemberId ? "hidden md:flex" : "flex"}`}>
        {activeMember ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setActiveMemberId(null); activeMemberRef.current = null; }}
                  className="md:hidden text-slate-500 mr-2"
                >
                  &larr; Back
                </button>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                  {activeMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{activeMember.name}</h2>
                  <p className="text-xs text-slate-500">{getMemberRoleName(activeMember)}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 bg-slate-50/30">
              {activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <UserCircle2 className="w-12 h-12 text-slate-200" />
                  <p className="text-sm">Start a conversation with {activeMember.name}</p>
                </div>
              ) : (
                activeMessages.map((msg, i) => {
                  const isMe = msg.sender_id === currentUser.id;
                  const showDate = i === 0 || new Date(msg.created_at).toDateString() !== new Date(activeMessages[i - 1].created_at).toDateString();
                  
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                            {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-br-sm"
                              : "bg-slate-100 text-slate-800 rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              {activeMemberId && typingMembers.has(activeMemberId) && (
                <div className="flex items-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 w-16 h-10">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
              <MessageSquareIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm">Select a team member to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
