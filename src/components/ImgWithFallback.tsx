"use client";

import { useCallback, useEffect, useState, type ImgHTMLAttributes } from "react";

import { productAssetPath } from "@/lib/productMedia";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> & {
  src: string;
  /** Shown if the primary `src` fails to load (404, blocked, etc.). */
  fallbackSrc?: string;
};

export function ImgWithFallback({
  src,
  fallbackSrc = productAssetPath("packaging"),
  alt = "",
  ...rest
}: Props) {
  const [resolved, setResolved] = useState(src);
  useEffect(() => {
    setResolved(src);
  }, [src]);
  const onError = useCallback(() => {
    setResolved((cur) => (cur === fallbackSrc ? cur : fallbackSrc));
  }, [fallbackSrc]);
  return <img src={resolved} alt={alt} onError={onError} {...rest} />;
}
