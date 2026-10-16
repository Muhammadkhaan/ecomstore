import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { Product, CurrencyCode } from '../types.ts';
import { PRODUCTS, CURRENCIES } from '../data/products.ts';

interface AiStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onSelectProduct: (product: Product) => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  recommendedProducts?: Product[];
}

export const AiStylistModal: React.FC<AiStylistModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSelectProduct,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Sat Sri Akal / Assalam-o-Alaikum! I am your Laam Luxury Concierge & AI Stylist. Tell me about your upcoming occasion (e.g. Nikkah, Mehndi, Festive Dinner, Valima), preferred color palette, or fabric, and I will curate a personalized designer look for you.",
      recommendedProducts: [PRODUCTS[0], PRODUCTS[4]]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const curr = CURRENCIES[currency];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Here are our top exquisite designer pieces handpicked for your occasion with pure raw silk and intricate zardozi craftsmanship:";
      let recs = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[4]];

      const lower = userMsg.toLowerCase();
      if (lower.includes('wedding') || lower.includes('valima') || lower.includes('heavy') || lower.includes('velvet')) {
        reply = "For grand winter weddings and formal valimas, our velvet kalidars and heavy zardozi ensembles offer majestic regal elegance.";
        recs = [PRODUCTS[4], PRODUCTS[7], PRODUCTS[11]];
      } else if (lower.includes('kaftan') || lower.includes('dinner') || lower.includes('party')) {
        reply = "For evening soirees and festive dinners, our flowing Italian silk kaftans with crystal embellishments are effortless and sophisticated.";
        recs = [PRODUCTS[0], PRODUCTS[1], PRODUCTS[3]];
      } else if (lower.includes('summer') || lower.includes('lawn') || lower.includes('yellow') || lower.includes('day')) {
        reply = "For daytime summer lunches and festive garden parties, our Swiss lawn and mint green organza suits are light, breezy, and breathtaking.";
        recs = [PRODUCTS[9], PRODUCTS[10], PRODUCTS[5]];
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          recommendedProducts: recs
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col h-[650px]">
        {/* Header */}
        <div className="bg-[#141414] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E04F16]/20 flex items-center justify-center border border-[#E04F16]/40">
              <Sparkles className="w-5 h-5 text-[#E04F16]" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">Laam Concierge & AI Stylist</h3>
              <p className="text-xs text-white/70">Personalized couture pairing & occasion matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAF9F6]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'ai' ? 'bg-[#141414] text-white' : 'bg-[#E04F16] text-white font-bold text-xs'
                }`}
              >
                {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm shadow-sm ${
                  m.sender === 'ai'
                    ? 'bg-white text-[#141414] border border-[#E5E5E5]'
                    : 'bg-[#141414] text-white'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>

                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-[#E5E5E5]">
                    <p className="text-[11px] font-semibold tracking-wider text-[#737373] uppercase">
                      Curated Recommendations:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {m.recommendedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            onSelectProduct(prod);
                            onClose();
                          }}
                          className="group bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-2.5 flex items-center gap-3 cursor-pointer hover:border-[#141414] transition-all"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-14 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-xs text-[#141414] truncate">{prod.name}</h4>
                            <p className="text-[11px] text-[#737373]">{prod.designer}</p>
                            <p className="text-xs font-bold text-[#E04F16] mt-0.5">
                              {curr.format(prod.priceUSD * curr.rate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#E5E5E5] px-4 py-3 rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E04F16] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#E04F16] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#E04F16] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 bg-white border-t border-[#E5E5E5] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-[#737373] shrink-0 font-medium">Quick ask:</span>
          {[
            'Nikkah Guest Outfit',
            'Heavy Velvet Bridal',
            'Silk Kaftan for Dinner',
            'Summer Lawn Suit'
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setInput(chip);
              }}
              className="px-3 py-1 bg-[#FAF9F6] border border-[#E5E5E5] rounded-full text-[11px] text-[#424242] hover:bg-[#141414] hover:text-white transition-colors whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#E5E5E5] flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about occasion styling, fabrics, or matching dupattas..."
            className="flex-1 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl px-4 py-3 text-xs text-[#141414] focus:outline-none focus:border-[#141414]"
          />
          <button
            type="submit"
            className="bg-[#141414] text-white px-5 py-3 rounded-xl hover:bg-[#2b2b2b] transition-colors flex items-center gap-2 text-xs font-semibold shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
