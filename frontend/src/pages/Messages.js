import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

let socket;

export default function Messages() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join', user._id);
    return () => socket.disconnect();
  }, [user._id]);

  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const { data } = await API.get('/messages/conversations');
        setConversations(data.conversations);
        if (conversationId) {
          const conv = data.conversations.find(c => c._id === conversationId);
          if (conv) setActiveConv(conv);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchConvs();
  }, [conversationId]);

  useEffect(() => {
    if (!activeConv) return;
    const fetchMsgs = async () => {
      try {
        const { data } = await API.get(`/messages/${activeConv._id}`);
        setMessages(data.messages);
      } catch (err) { console.error(err); }
    };
    fetchMsgs();
    socket.emit('join_conversation', activeConv._id);
    const handleMsg = (msg) => setMessages(prev => [...prev, msg]);
    const handleTyping = (data) => { if (data.userId !== user._id) setTyping(data.typing); };
    socket.on('receive_message', handleMsg);
    socket.on('user_typing', handleTyping);
    return () => { socket.off('receive_message', handleMsg); socket.off('user_typing', handleTyping); };
  }, [activeConv, user._id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    if (newMsg.length > 5000) { toast.error('Message too long (max 5000 chars)'); return; }
    setSending(true);
    try {
      await API.post(`/messages/${activeConv._id}`, { content: newMsg.trim() });
      setNewMsg('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const handleTypingInput = (e) => {
    setNewMsg(e.target.value);
    if (activeConv) {
      socket.emit('typing', { conversationId: activeConv._id, userId: user._id, typing: true });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('typing', { conversationId: activeConv._id, userId: user._id, typing: false });
      }, 2000);
    }
  };

  const getOther = (conv) => conv?.participants?.find(p => p._id !== user._id);

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 65px)' }}>
        {/* Sidebar */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg2)' }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8 }} />)}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text2)', fontSize: '0.85rem' }}>
                No conversations yet.<br />Browse projects to start chatting.
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOther(conv);
                const isActive = activeConv?._id === conv._id;
                return (
                  <div key={conv._id}
                    onClick={() => { setActiveConv(conv); navigate(`/messages/${conv._id}`); }}
                    style={{ padding: '12px 16px', cursor: 'pointer', background: isActive ? 'rgba(108,99,255,0.1)' : 'transparent', borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent', transition: 'var(--transition)' }}
                    onMouseOver={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseOut={e => !isActive && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.9rem', flexShrink: 0 }}>
                        {other?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{other?.name}</div>
                        {conv.project && <div style={{ fontSize: '0.72rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📁 {conv.project.title}</div>}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text3)', flexShrink: 0 }}>
                        {conv.lastMessageAt && new Date(conv.lastMessageAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        {!activeConv ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <h3 style={{ color: 'var(--text2)', fontWeight: 500 }}>Select a conversation to start messaging</h3>
            <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Messages are encrypted end-to-end</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg2)' }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                {getOther(activeConv)?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{getOther(activeConv)?.name}</div>
                {activeConv.project && <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Re: {activeConv.project.title}</div>}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 10px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, i) => {
                const isMe = msg.sender?._id === user._id;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                    {!isMe && <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.72rem', flexShrink: 0 }}>{msg.sender?.name?.charAt(0)?.toUpperCase()}</div>}
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMe ? 'var(--accent)' : 'var(--bg3)', color: isMe ? '#fff' : 'var(--text)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && msg.readBy?.length > 1 && ' · ✓✓'}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing && <div style={{ padding: '8px 14px', background: 'var(--bg3)', borderRadius: 12, color: 'var(--text3)', fontSize: '0.82rem', width: 'fit-content' }}>typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <input
                placeholder="Type a message..."
                value={newMsg}
                onChange={handleTypingInput}
                style={{ flex: 1, borderRadius: 20, padding: '10px 16px' }}
              />
              <button type="submit" className="btn btn-primary" disabled={sending || !newMsg.trim()} style={{ borderRadius: 20, padding: '10px 18px' }}>
                {sending ? <span className="spinner" /> : '→'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
