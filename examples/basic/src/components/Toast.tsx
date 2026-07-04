import { useCallback, useEffect, useState } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
}

let toastIdCounter = 0;

interface ToastProps {
  messages: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function Toast({ messages, onDismiss }: ToastProps) {
  return (
    <div className="toast-stack">
      {messages.map(message => (
        <ToastItem key={message.id} message={message} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ message, onDismiss }: { message: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(message.id), 3000);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  return (
    <div className="toast-item" onClick={() => onDismiss(message.id)}>
      {message.text}
    </div>
  );
}

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string) => {
    const id = ++toastIdCounter;
    setMessages(prev => [...prev, { id, text }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  }, []);

  return { messages, showToast, dismissToast };
}
