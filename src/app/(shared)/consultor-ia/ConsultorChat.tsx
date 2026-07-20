"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { IoSendSharp } from "react-icons/io5";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export function ConsultorChat({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "¡Hola! Soy tu consultor IA ¿en qué puedo ayudarte hoy?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Estoy procesando tu solicitud analíticamente, pero recuerda que sigo siendo un esqueleto estático hasta que mi backend despierte. ✨",
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const userInitial = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <Card className="flex flex-col h-[calc(100vh-140px)] shadow-sm border-0 bg-white rounded-xl overflow-hidden">
      <div className="px-8 pt-6 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-color-boton-2">Consultor IA</h1>
      </div>

      <div className="flex items-center gap-3 px-8 py-3 border-y border-slate-100 bg-white shrink-0">
        <div className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-sm overflow-hidden">
          <Image
            src="/img_app/icono_sin_relleno.png"
            alt="Avatar Consultor"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
        <span className="text-[14px] font-semibold text-color-boton-2">Asistente Virtual</span>
      </div>

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1 min-h-0 px-6">
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-5 py-4">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <MessageScrollerItem key={msg.id} messageId={msg.id} scrollAnchor={isUser}>
                    <Message align={isUser ? "end" : "start"}>
                      <MessageAvatar>
                        <Avatar className="size-9 border border-slate-200">
                          {isUser ? (
                            <AvatarFallback className="bg-color-boton-2 text-white text-xs font-bold">
                              {userInitial}
                            </AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage
                                src="/img_app/icono_sin_relleno.png"
                                alt="Consultor IA"
                                className="object-contain p-1.5"
                              />
                              <AvatarFallback className="bg-white text-xs">IA</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        <Bubble
                          variant={isUser ? "default" : "muted"}
                          className={
                            isUser
                              ? "*:data-[slot=bubble-content]:bg-color-boton-2 *:data-[slot=bubble-content]:text-white *:data-[slot=bubble-content]:border-transparent max-w-2xl"
                              : "*:data-[slot=bubble-content]:bg-slate-50 *:data-[slot=bubble-content]:text-slate-700 *:data-[slot=bubble-content]:border-slate-200 max-w-2xl"
                          }
                        >
                          <BubbleContent className="text-[13px] px-4 py-3">
                            {msg.text}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}
              {isTyping && (
                <MessageScrollerItem messageId="typing" scrollAnchor={false}>
                  <Message align="start">
                    <MessageAvatar>
                      <Avatar className="size-9 border border-slate-200">
                        <AvatarImage
                          src="/img_app/icono_sin_relleno.png"
                          alt="Consultor IA"
                          className="object-contain p-1.5"
                        />
                        <AvatarFallback className="bg-white text-xs">IA</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <Bubble variant="muted">
                        <BubbleContent className="text-[13px] text-slate-500 italic">
                          Escribiendo...
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isTyping}
            className="flex-1 border-slate-300 focus-visible:ring-1 focus-visible:ring-color-boton-2 h-11 px-4 bg-white"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isTyping}
            className="h-11 w-11 bg-color-boton-hover hover:bg-color-boton-2 rounded-full shrink-0 transition-all"
          >
            <IoSendSharp className="h-[18px] w-[18px] text-white ml-[2px]" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
