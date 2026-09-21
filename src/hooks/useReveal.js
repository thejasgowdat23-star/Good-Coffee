import { useCallback, useEffect, useRef, useState } from 'react';

export default function useReveal({ once = true } = {}) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState !== 'hidden');

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting && once) {
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  useEffect(() => {
    const handleVisibility = () => setTabVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const setRef = useCallback(element => {
    elementRef.current = element;
  }, []);

  return { setRef, visible: visible && tabVisible };
}
