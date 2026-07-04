import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Locale } from "../content";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ui = {
  en: {
    label: "Project Concierge",
    status: "AI project adviser",
    greeting:
      "Tell me what you are planning. I can help shape the scope before you send the drawings.",
    placeholder: "Ask about your project",
    open: "Open project concierge",
    close: "Close project concierge",
    send: "Send message",
    quote: "Send Your Drawings",
    error: "I could not connect just now. You can still send your drawings for a direct review.",
    prompts: ["Can MLWK support a villa?", "What should I send for a quote?"],
  },
  zh: {
    label: "项目顾问",
    status: "AI 项目顾问",
    greeting: "告诉我你正在规划什么。在上传图纸前，我可以先帮你梳理项目范围。",
    placeholder: "咨询你的项目",
    open: "打开项目顾问",
    close: "关闭项目顾问",
    send: "发送消息",
    quote: "上传图纸询价",
    error: "暂时未能连接。你仍可上传图纸，由团队直接评估。",
    prompts: ["可以承接别墅整屋木作吗？", "询价需要准备什么？"],
  },
  ar: {
    label: "مستشار المشروع",
    status: "مستشار مشاريع بالذكاء الاصطناعي",
    greeting: "أخبرني بما تخطط له. يمكنني مساعدتك في تحديد النطاق قبل إرسال المخططات.",
    placeholder: "اسأل عن مشروعك",
    open: "فتح مستشار المشروع",
    close: "إغلاق مستشار المشروع",
    send: "إرسال الرسالة",
    quote: "أرسل مخططاتك",
    error: "تعذر الاتصال الآن. يمكنك إرسال المخططات للمراجعة المباشرة.",
    prompts: ["هل تدعمون مشاريع الفلل؟", "ماذا أرسل لطلب عرض سعر؟"],
  },
  de: {
    label: "Projektberatung",
    status: "KI-Projektberatung",
    greeting:
      "Erzählen Sie mir von Ihrem Vorhaben. Ich helfe, den Umfang vor dem Versand der Pläne zu klären.",
    placeholder: "Frage zum Projekt",
    open: "Projektberatung öffnen",
    close: "Projektberatung schließen",
    send: "Nachricht senden",
    quote: "Pläne senden",
    error: "Die Verbindung ist gerade nicht möglich. Sie können Ihre Pläne direkt zur Prüfung senden.",
    prompts: ["Unterstützt MLWK Villenprojekte?", "Was wird für ein Angebot benötigt?"],
  },
  fr: {
    label: "Concierge projet",
    status: "Conseiller projet IA",
    greeting:
      "Parlez-moi de votre projet. Je peux vous aider à préciser le périmètre avant l'envoi des plans.",
    placeholder: "Question sur votre projet",
    open: "Ouvrir le concierge projet",
    close: "Fermer le concierge projet",
    send: "Envoyer le message",
    quote: "Envoyer vos plans",
    error: "La connexion est momentanément indisponible. Vous pouvez envoyer vos plans pour une étude directe.",
    prompts: ["Accompagnez-vous les villas ?", "Que faut-il joindre au devis ?"],
  },
} satisfies Record<Locale, Record<string, string | string[]>>;

function localReply(locale: Locale, question: string) {
  const asksQuote = /quote|price|cost|devis|angebot|询价|报价|سعر|عرض/i.test(question);
  const replies: Record<Locale, [string, string]> = {
    en: [
      "MLWK develops kitchens, wardrobes, vanities, wall panels, interior doors and built-ins as one coordinated millwork package. What type of space are you planning?",
      "For a useful review, send the available plans, project location, scope, approximate quantities, finish direction and target delivery window. Exact pricing follows a drawing review.",
    ],
    zh: [
      "MLWK 可将厨房、衣柜、浴室柜、墙板、室内门与定制固定家具作为一套完整木作系统深化。你正在规划哪一类空间？",
      "建议提供现有图纸、项目地点、木作范围、预估数量、材质方向和期望交付时间。准确报价需要先审核图纸。",
    ],
    ar: [
      "تطوّر MLWK المطابخ والخزائن ووحدات الحمام والجدران والأبواب والأثاث المدمج كحزمة واحدة. ما نوع المساحة التي تخطط لها؟",
      "للمراجعة نحتاج إلى المخططات المتاحة وموقع المشروع والنطاق والكميات التقريبية واتجاه التشطيب وموعد التسليم المطلوب.",
    ],
    de: [
      "MLWK entwickelt Küchen, Schränke, Waschtische, Wandpaneele, Innentüren und Einbauten als abgestimmtes Gesamtpaket. Um welchen Raumtyp geht es?",
      "Für eine fundierte Prüfung senden Sie Pläne, Projektort, Umfang, Mengen, Oberflächenrichtung und Zieltermin. Der genaue Preis folgt nach Planprüfung.",
    ],
    fr: [
      "MLWK développe cuisines, dressings, meubles vasques, panneaux, portes et agencements comme un ensemble coordonné. Quel espace préparez-vous ?",
      "Pour une étude utile, joignez les plans, le lieu, le périmètre, les quantités, l'orientation des finitions et le délai visé. Le prix précis suit l'analyse des plans.",
    ],
  };
  return replies[locale][asksQuote ? 1 : 0];
}

export default function Concierge({ locale }: { locale: Locale }) {
  const copy = ui[locale];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: copy.greeting as string },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 240);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const send = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || sending) return;
    const nextMessages = [...messages, { role: "user", content: trimmed } as ChatMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: nextMessages }),
      });
      if (!response.ok) throw new Error("Chat request failed");
      const result = (await response.json()) as { message?: string };
      if (!result.message) throw new Error("Chat response was empty");
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.message as string },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname === "localhost"
              ? localReply(locale, trimmed)
              : (copy.error as string),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  return (
    <aside className="concierge">
      <AnimatePresence>
        {open && (
          <motion.section
            className="concierge-panel"
            role="dialog"
            aria-label={copy.label as string}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="concierge-header">
              <span className="concierge-mark">
                <Sparkles size={17} />
              </span>
              <span>
                <strong>{copy.label}</strong>
                <small>{copy.status}</small>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close as string}
              >
                <X size={18} />
              </button>
            </header>

            <div className="concierge-messages" ref={scrollRef} aria-live="polite">
              {messages.map((message, index) => (
                <p
                  key={`${message.role}-${index}`}
                  className={`concierge-message concierge-message--${message.role}`}
                >
                  {message.content}
                </p>
              ))}
              {sending && (
                <span className="concierge-typing" aria-label="Thinking">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>

            {messages.length === 1 && (
              <div className="concierge-prompts">
                {(copy.prompts as string[]).map((prompt) => (
                  <button key={prompt} type="button" onClick={() => void send(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <form className="concierge-form" onSubmit={submit}>
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={copy.placeholder as string}
                maxLength={2000}
              />
              <button
                type="submit"
                aria-label={copy.send as string}
                disabled={!input.trim() || sending}
              >
                <Send size={17} />
              </button>
            </form>
            <Link className="concierge-quote" to={`/${locale}/quote`}>
              {copy.quote}
              <ArrowUpRight size={15} />
            </Link>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        className={`concierge-toggle ${open ? "is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={(open ? copy.close : copy.open) as string}
        aria-expanded={open}
      >
        <MessageCircle size={22} />
        <span>{copy.label}</span>
      </button>
    </aside>
  );
}
