"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, ShoppingBag, Maximize2, Minimize2, Check, Sparkles, Heart, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/store/wishlistStore";
import { useCollections } from "@/store/collectionsStore";
import type { Product } from "@/types/product";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  visualization?: string;
  visualizationLoading?: boolean;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [selectedByMessage, setSelectedByMessage] = useState<Record<string, Set<string>>>({});
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [saveModal, setSaveModal] = useState<{ messageId: string; productIds: string[] } | null>(null);
  const [collectionName, setCollectionName] = useState("");

  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { saveCollection } = useCollections();;

  function toggleSelect(messageId: string, productId: string) {
    setSelectedByMessage((prev) => {
      const current = new Set(prev[messageId] ?? []);
      if (current.has(productId)) current.delete(productId);
      else current.add(productId);
      return { ...prev, [messageId]: current };
    });
  }
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! 👋 I'm your **NØRD AI stylist**.\n\nTell me what you're looking for — I can suggest outfits for any occasion!\n\nTry something like:\n1. \"I need an outfit for a date\"\n2. \"Smart casual office wear under $200\"\n3. \"Wedding guest outfit for summer\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addItem } = useCart();

  async function handleVisualize(messageId: string, productIds: string[]) {
    setMessages((prev) =>
      prev.map((m) => m.id === messageId ? { ...m, visualizationLoading: true } : m)
    );
    try {
      const res = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, visualizationLoading: false, visualization: data.image ?? undefined }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === messageId ? { ...m, visualizationLoading: false } : m)
      );
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        products: data.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddToCart(product: Product) {
    const defaultSize = product.sizes[Math.floor(product.sizes.length / 2)];
    addItem(product, defaultSize);
    setAddedItems((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  }

  return (
    <>
      {/* Chat bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed z-50 flex flex-col border bg-background shadow-2xl transition-all duration-300 ${
            expanded
              ? "inset-y-4 left-1/2 -translate-x-1/2 w-[700px] max-w-[calc(100vw-2rem)] rounded-2xl"
              : "bottom-6 right-6 h-[600px] w-[420px] max-h-[80vh] max-w-[calc(100vw-3rem)] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                N
              </div>
              <div>
                <p className="text-sm font-semibold">NØRD Stylist</p>
                <p className="text-xs text-muted-foreground">AI Fashion Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-muted-foreground hover:text-foreground p-1 rounded"
                title={expanded ? "Minimize" : "Expand"}
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button onClick={() => { setOpen(false); setExpanded(false); }} className="text-muted-foreground hover:text-foreground p-1 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:pl-4 [&_ol]:my-2 [&_ol]:pl-4 [&_li]:my-1 [&_li]:leading-snug [&_strong]:font-semibold [&_strong]:text-foreground [&_hr]:my-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {/* Product cards in message */}
                    {msg.products && msg.products.length > 0 && (
                      <>
                        <p className="mt-2 mb-1 text-[10px] text-muted-foreground">Select items to visualize on a model:</p>
                        <div className={`${expanded ? "grid grid-cols-2 gap-2" : "space-y-2"}`}>
                          {msg.products.map((product) => {
                            const isSelected = selectedByMessage[msg.id]?.has(product.id) ?? false;
                            return (
                          <div
                            key={product.id}
                            onClick={() => toggleSelect(msg.id, product.id)}
                            className={`flex gap-3 rounded-lg border bg-background p-3 cursor-pointer transition-colors ${
                              isSelected ? "border-primary ring-1 ring-primary" : "hover:border-primary/40"
                            }`}
                          >
                            <div className="relative flex h-16 w-14 shrink-0 overflow-hidden rounded bg-muted">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                                  <Check className="h-4 w-4 text-primary drop-shadow" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col">
                              <div className="flex items-start justify-between gap-1">
                                <Link
                                  href={`/products/${product.slug}`}
                                  className="text-xs font-medium hover:underline text-foreground"
                                >
                                  {product.name}
                                </Link>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                  className="shrink-0 p-0.5 text-muted-foreground hover:text-rose-500 transition-colors"
                                  title={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                  <Heart className={`h-3.5 w-3.5 ${isWishlisted(product.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                                </button>
                              </div>
                              <span className="text-xs text-muted-foreground">{product.subcategory}</span>
                              <div className="mt-auto flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">
                                  {formatPrice(product.salePrice ?? product.price)}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                  disabled={addedItems.has(product.id)}
                                  className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors ${
                                    addedItems.has(product.id)
                                      ? "bg-green-500 text-white cursor-default"
                                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                                  }`}
                                >
                                  {addedItems.has(product.id) ? (
                                    <><Check className="h-3 w-3" /> Added!</>
                                  ) : (
                                    <><ShoppingBag className="h-3 w-3" /> Add</>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Visualize outfit button + Save collection */}
                    {msg.products && msg.products.length >= 1 && (() => {
                      const sel = selectedByMessage[msg.id];
                      const selectedIds = sel && sel.size > 0 ? [...sel] : null;
                      return (
                        <div className="mt-3 flex flex-col gap-2">
                          {!msg.visualization && (
                            <button
                              onClick={() => selectedIds && handleVisualize(msg.id, selectedIds)}
                              disabled={!!msg.visualizationLoading || !selectedIds}
                              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {msg.visualizationLoading ? (
                                <><Loader2 className="h-3 w-3 animate-spin" /> Generating...(30-60s)</>
                              ) : selectedIds ? (
                                <><Sparkles className="h-3 w-3" /> Try on {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} on a model</>
                              ) : (
                                <><Sparkles className="h-3 w-3" /> Select items to visualize</>
                              )}
                            </button>
                          )}
                          {selectedIds && (
                            <button
                              onClick={() => { setSaveModal({ messageId: msg.id, productIds: selectedIds }); setCollectionName(""); }}
                              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/10"
                            >
                              <BookmarkPlus className="h-3 w-3" /> Save {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} as collection
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Generated outfit visualization */}
                    {msg.visualization && (
                      <div className="mt-3 overflow-hidden rounded-lg border w-fit">
                        <img
                          src={msg.visualization}
                          alt="AI outfit visualization"
                          className="max-h-72 w-auto object-cover cursor-zoom-in"
                          onClick={() => setLightbox(msg.visualization!)}
                          title="Click to enlarge"
                        />
                        <p className="bg-muted px-3 py-1.5 text-[10px] text-muted-foreground">
                          ✨ AI-generated look · <span className="underline cursor-pointer" onClick={() => setLightbox(msg.visualization!)}>enlarge</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 rounded-bl-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="What occasion are you shopping for?"
                className="min-h-[44px] max-h-[120px] resize-none text-sm"
                rows={1}
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Collection Modal */}
      {saveModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSaveModal(null)}
        >
          <div
            className="bg-background rounded-2xl p-6 w-80 shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-1">Save as Collection</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {saveModal.productIds.length} item{saveModal.productIds.length > 1 ? "s" : ""} will be saved
            </p>
            <input
              autoFocus
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && collectionName.trim()) {
                  saveCollection(collectionName.trim(), saveModal.productIds);
                  setSaveModal(null);
                }
              }}
              placeholder="e.g. Date night outfit"
              className="w-full rounded-lg border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (collectionName.trim()) {
                    saveCollection(collectionName.trim(), saveModal.productIds);
                    setSaveModal(null);
                  }
                }}
                disabled={!collectionName.trim()}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Collection
              </button>
              <button
                onClick={() => setSaveModal(null)}
                className="rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/40"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox}
            alt="AI outfit visualization"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
