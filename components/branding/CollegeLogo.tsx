import Image from "next/image";
import clsx from "clsx";

type CollegeLogoProps = {
  size?: number;
  className?: string;
  imageClassName?: string;
  alt?: string;
};

export default function CollegeLogo({
  size = 36,
  className,
  imageClassName,
  alt = "Trinity Lutheran College logo",
}: CollegeLogoProps) {
  return (
    <span
      className={clsx("relative inline-flex shrink-0 overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/api/branding/logo"
        alt={alt}
        fill
        sizes={`${size}px`}
        className={clsx("object-contain", imageClassName)}
        priority
      />
    </span>
  );
}
