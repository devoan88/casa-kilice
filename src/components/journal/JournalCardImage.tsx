"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { JOURNAL_CARD_BLUR_DATA_URL } from "@/lib/journal/blurDataUrl";

const PLACEHOLDER = "/journal/placeholder.svg";

type Props = {
  imageUrl?: string;
  alt: string;
};

export function JournalCardImage({ imageUrl, alt }: Props) {
  const [src, setSrc] = useState(() => (imageUrl?.trim() ? imageUrl : PLACEHOLDER));

  const handleError = useCallback(() => {
    setSrc((cur) => (cur === PLACEHOLDER ? cur : PLACEHOLDER));
  }, []);

  const isPlaceholder = src === PLACEHOLDER;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      placeholder="blur"
      blurDataURL={JOURNAL_CARD_BLUR_DATA_URL}
      onError={handleError}
      unoptimized={isPlaceholder}
    />
  );
}
