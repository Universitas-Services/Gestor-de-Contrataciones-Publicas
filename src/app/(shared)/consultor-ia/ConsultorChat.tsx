"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IoSendSharp } from "react-icons/io5";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export function ConsultorChat({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "¡Hola! Soy tu consultor IA ¿en qué puedo ayudarte hoy?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Estoy procesando tu solicitud analíticamente, pero recuerda que sigo siendo un esqueleto estático hasta que mi backend despierte. ✨",
        },
      ]);
    }, 1000);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-140px)] shadow-sm border-0 bg-white rounded-xl overflow-hidden">
      {/* Título de la página */}
      <div className="px-8 pt-6 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-color-boton-2">Consultor IA</h1>
      </div>

      {/* Sub-header estilo chat */}
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

      {/* Área de mensajes */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="flex flex-col gap-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 items-start ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full overflow-hidden ${
                  msg.sender === "bot"
                    ? "bg-white border border-slate-200"
                    : "bg-color-boton-2 text-white"
                }`}
              >
                {msg.sender === "bot" ? (
                  <Image
                    src="/img_app/icono_sin_relleno.png"
                    alt="Avatar Consultor IA"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                ) : (
                  <span className="font-bold text-xs">{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Burbuja */}
              <div
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-xl max-w-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.sender === "bot"
                      ? "bg-slate-50 text-slate-700 border border-slate-200 rounded-tl-none"
                      : "bg-color-boton-2 text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input footer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border-slate-300 focus-visible:ring-1 focus-visible:ring-color-boton-2 h-11 px-4 bg-white"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim()}
            className="h-11 w-11 bg-color-boton-hover hover:bg-color-boton-2 rounded-full shrink-0 transition-all"
          >
            <IoSendSharp className="h-[18px] w-[18px] text-white ml-[2px]" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
