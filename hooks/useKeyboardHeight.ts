import { useEffect, useState, RefObject } from 'react';

export function useKeyboardHeight(keyboardRef: RefObject<HTMLDivElement>): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!keyboardRef.current) return;

    const updateHeight = () => {
      if (keyboardRef.current) {
        const rect = keyboardRef.current.getBoundingClientRect();
        setHeight(rect.height);
      }
    };

    // Initial measurement
    updateHeight();

    // Use ResizeObserver for dynamic updates
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(keyboardRef.current);

    // Also listen to window resize
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [keyboardRef]);

  return height;
}

