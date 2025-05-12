import { useState } from "react";

export const useCopy = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    // check if clipboard api is available
    if (!navigator.clipboard) return;

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);

      // Reset isCopied
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return { isCopied, copyToClipboard };
};
