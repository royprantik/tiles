import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';

export default function AiAssistant({ isOpen, setIsOpen, onOpenCalc, onInquire, allProducts = [] }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Design & Tile Advisor for M R Tiles & Sanitation. How can I help you calculate coverage, pick tile finishes, or estimate budget today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Client-side AI Fallback logic if API server is not available
  const generateClientAiResponse = (userQuery) => {
    const query = userQuery.toLowerCase();
    let reply = "";
    let suggestedProducts = [];

    const dimMatch = query.match(/(\d+)\s*(?:x|by|\*)\s*(\d+)/i);
    if (dimMatch && (query.includes('cost') || query.includes('sq.ft') || query.includes('room') || query.includes('tile') || query.includes('price') || query.includes('box'))) {
      const l = parseFloat(dimMatch[1]);
      const w = parseFloat(dimMatch[2]);
      const area = l * w;
      const areaWithWastage = Math.ceil(area * 1.1); // 10% wastage
      const tilePriceAvg = 65;
      const boxSqFt = 16;
      const boxesNeeded = Math.ceil(areaWithWastage / boxSqFt);
      const estimatedCost = areaWithWastage * tilePriceAvg;

      reply = `For a room of **${l} ft × ${w} ft** (${area} sq.ft total area):\n\n` +
        `• **Net Area**: ${area} sq.ft\n` +
        `• **Total Area with 10% Wastage**: ~${areaWithWastage} sq.ft\n` +
        `• **Estimated Box Count (2×2 ft tiles)**: ~${boxesNeeded} boxes (${boxesNeeded * boxSqFt} sq.ft)\n` +
        `• **Estimated Cost (at avg ₹65/sq.ft)**: ₹${estimatedCost.toLocaleString('en-IN')}\n\n` +
        `Here are recommended floor tiles available in our showroom stock:`;

      suggestedProducts = allProducts.filter(p => p.category === 'floor-tiles').slice(0, 2);
    } else if (query.includes('bathroom') || query.includes('basin') || query.includes('commode') || query.includes('toilet') || query.includes('fitting')) {
      reply = `For modern bathroom solutions at M R Tiles & Sanitation, we recommend matching wall-hung sanitaryware with anti-skid floor tiles:\n\n` +
        `• **Sanitaryware**: Modern Wall Hung Basins (from ₹4,850) and Smart Rimless Commodes (from ₹6,950).\n` +
        `• **Wall Tiles**: Glossy ceramic 1×2 ft tiles for easy cleaning.\n` +
        `• **Floor**: Matte anti-skid finish porcelain tiles for safety.`;

      suggestedProducts = allProducts.filter(p => p.category === 'bathroom-fittings' || p.category === 'wall-tiles').slice(0, 3);
    } else if (query.includes('white') || query.includes('marble') || query.includes('regal')) {
      reply = `Our **Regal White Marble** vitrified tiles (₹70/sq.ft) are top sellers! They feature high-gloss polished surfaces with subtle grey and gold veining that makes rooms look radiant.`;
      suggestedProducts = allProducts.filter(p => p.id === 'prod_1' || p.category === 'floor-tiles').slice(0, 2);
    } else if (query.includes('grey') || query.includes('moroccan')) {
      reply = `Our **Moroccan Grey** tiles (₹55/sq.ft) offer a contemporary satin matt finish. Perfect for anti-slip durability in living spaces, corridors, and offices.`;
      suggestedProducts = allProducts.filter(p => p.id === 'prod_2' || p.category === 'floor-tiles').slice(0, 2);
    } else {
      reply = `Hello! I am your AI Design & Tile Advisor for **M R Tiles & Sanitation**.\n\n` +
        `I can help you with:\n` +
        `1. **Calculating tiles & box counts** for your room size (e.g. type *"Calculate cost for 12x15 room"*)\n` +
        `2. **Recommending tile finishes** for bathrooms, living rooms, and kitchens\n` +
        `3. **Checking stock availability & pricing** for our items`;
      suggestedProducts = allProducts.slice(0, 2);
    }

    return { reply, suggestedProducts };
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(prev => [
            ...prev, 
            { 
              sender: 'ai', 
              text: data.reply, 
              suggestedProducts: data.suggestedProducts 
            }
          ]);
          setLoading(false);
          return;
        }
      }
    } catch (err) {}

    // Fallback response generator
    const fallbackRes = generateClientAiResponse(userText);
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: fallbackRes.reply,
        suggestedProducts: fallbackRes.suggestedProducts
      }
    ]);
    setLoading(false);
  };

  return (
    <div className="ai-widget">
      {!isOpen && (
        <button className="ai-trigger" onClick={() => setIsOpen(true)}>
          <Sparkles size={24} />
          <span className="ai-badge-dot"></span>
        </button>
      )}

      {isOpen && (
        <div className="ai-window glass-panel">
          <div className="ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'var(--accent-gold)', padding: '0.4rem', borderRadius: '50%', color: '#fff' }}>
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', margin: 0 }}>AI Tile & Room Advisor</h4>
                <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ● Active Catalog Assistant
                </span>
              </div>
            </div>
            <button 
              style={{ background: 'transparent', color: 'var(--text-muted)' }} 
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={`chat-bubble ${msg.sender}`}>
                  {msg.text.split('\n').map((line, lIdx) => (
                    <p key={lIdx} style={{ marginBottom: line ? '0.35rem' : '0' }}>
                      {line}
                    </p>
                  ))}
                </div>

                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div style={{ width: '85%', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recommended Items:</span>
                    {msg.suggestedProducts.map(p => (
                      <div key={p.id} style={{ background: 'rgba(18,24,38,0.9)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold-bright)' }}>₹{p.price}/{p.unit}</div>
                        </div>
                        <button 
                          className="btn-sm-inquire"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => onInquire(p)}
                        >
                          Inquire
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble ai" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Sparkles size={14} className="spin" /> Thinking & calculating...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(18,24,38,0.95)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            <button 
              type="button"
              onClick={() => { setInput('Calculate cost for 12x10 ft room'); }}
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
            >
              📐 12x10 room cost
            </button>
            <button 
              type="button"
              onClick={() => { setInput('Best tiles for bathroom'); }}
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
            >
              🚿 Bathroom tiles
            </button>
          </div>

          <form className="ai-input-wrap" onSubmit={handleSend}>
            <input 
              type="text"
              className="ai-input"
              placeholder="Ask about tiles, room cost..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="ai-send-btn" disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
