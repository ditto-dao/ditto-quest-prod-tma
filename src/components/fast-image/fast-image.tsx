import React, { useState, useEffect } from "react";
import { getCachedImage, preloadImageCached } from "../../utils/image-cache";

interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string; // Optional fallback image
}

/**
 * FastImage component - Instant rendering from cache
 * Drop-in replacement for <img> tags
 */
export function FastImage({ src, alt, fallback, ...props }: FastImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [_, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if already cached
    const cachedImage = getCachedImage(src);

    if (cachedImage) {
      setImageSrc(cachedImage.src);
      return;
    }

    // Not cached, load it
    setIsLoading(true);
    preloadImageCached(src)
      .then((img) => {
        setImageSrc(img.src);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("FastImage load failed:", error);
        if (fallback) {
          setImageSrc(fallback);
        }
        setIsLoading(false);
      });
  }, [src, fallback]);

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      style={{
        imageRendering: "pixelated",
        ...props.style,
      }}
    />
  );
}

export default FastImage;
