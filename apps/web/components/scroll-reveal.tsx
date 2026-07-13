"use client";

import {
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type ScrollRevealProps<T extends ElementType = "div"> = {
  as?: T;
  delay?: number;
  className?: string;
  threshold?: number;
  children?: React.ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "style"> & {
    style?: CSSProperties;
  };

export function ScrollReveal<T extends ElementType = "div">({
  as,
  delay = 0,
  className,
  threshold = 0.14,
  children,
  style,
  ...props
}: ScrollRevealProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<"down" | "up">("down");
  const [armed, setArmed] = useState(false);
  const [inView, setInView] = useState(false);
  const [revealFrom, setRevealFrom] = useState<"below" | "above">("below");

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollDirection.current = currentScrollY > lastScrollY.current ? "down" : "up";
      lastScrollY.current = currentScrollY;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealFrom(scrollDirection.current === "up" ? "above" : "below");
          setInView(true);
          return;
        }

        setInView(false);
      },
      {
        threshold,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    window.addEventListener("scroll", handleScroll, { passive: true });
    observer.observe(element);

    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const initiallyVisible =
        rect.top < window.innerHeight * 0.94 && rect.bottom > window.innerHeight * 0.06;

      setArmed(true);
      setInView(initiallyVisible);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <Component
      ref={ref}
      className={cn(
        "scroll-reveal",
        armed && "is-armed",
        inView && "is-in-view",
        revealFrom === "above" ? "reveal-from-above" : "reveal-from-below",
        className,
      )}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
}
