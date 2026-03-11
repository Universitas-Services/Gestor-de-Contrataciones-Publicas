"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Respuesta Simulada del Bot
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
    <Card className="flex flex-col h-[65vh] shadow-sm border-0 bg-[#F8FAFC] rounded-xl">
      {/* Header del Contacto (Oculta scroll por debajo y se asemeja a cabecera de WhatsApp/Telegram) */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-slate-100 z-10 bg-[#F8FAFC] rounded-t-xl">
        <div className="flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-full bg-slate-50 border-2 border-slate-100 shadow-sm overflow-hidden">
          <img
            src="/img_app/icono_sin_relleno.png"
            alt="Avatar Consultor"
            className="h-6 w-6 object-contain"
          />
        </div>
        <h2 className="text-[16px] font-bold text-[#1B456F]">Consultor IA</h2>
      </div>

      {/* Área del Historial */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-6 py-6 pt-8">
          <div className="flex flex-col gap-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 items-start ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full overflow-hidden ${
                    msg.sender === "bot" ? "bg-white border" : "bg-[#1B456F] text-white"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <img
                      src="/img_app/icono_sin_relleno.png"
                      alt="Avatar Consultor IA"
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    <span className="font-bold text-sm">{userName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Burbuja Texto */}
                <div
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-5 py-3.5 rounded-lg max-w-2xl text-[13px] ${
                      msg.sender === "bot"
                        ? "bg-white text-slate-600 border border-slate-200 shadow-sm rounded-tl-none leading-relaxed"
                        : "bg-[#1B456F] text-white shadow-sm rounded-tr-none leading-relaxed"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input Area (Footer) */}
      <div className="p-4 border-t border-slate-200 bg-[#F8FAFC] rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border-slate-300 focus-visible:ring-1 focus-visible:ring-[#1B456F] h-12 px-5 bg-[#F8FAFC]"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim()}
            className="h-12 w-12 bg-[#34495E] hover:bg-[#2c3e50] rounded-full shrink-0 transition-all"
          >
            <IoSendSharp className="h-[20px] w-[20px] text-[#ffffff] ml-[3px]" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
