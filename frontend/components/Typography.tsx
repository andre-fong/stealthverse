interface TypographyProps {
  children: string;
  className?: string;
  highlightArray?: number[];
  rotateMap?: Record<number, number>;
  skewMap?: Record<number, number>;
  scaleMap?: Record<number, number>;
  shadow?: boolean;
  rollIn?: boolean;
}

export default function Typography({
  children,
  className = "",
  highlightArray = [],
  rotateMap = {},
  skewMap = {},
  scaleMap = {},
  shadow = false,
  rollIn = false,
}: TypographyProps) {
  return (
    <div
      className={
        className +
        " tracking-tight font-headline flex items-center leading-[0.8]"
      }
    >
      {children
        .toUpperCase()
        .split("")
        .map((char, index) => {
          const isHighlighted = highlightArray.includes(index);
          return (
            <div
              key={index}
              style={{
                backgroundColor: shadow ? "black" : "transparent",
                transform: rollIn
                  ? undefined
                  : `scale(${scaleMap[index] || 1})`,
                marginLeft: `${((scaleMap[index] || 1) - 1) * 0.6}em`,
                marginRight: `${((scaleMap[index] || 1) - 1) * 0.6}em`,
                ...(rollIn
                  ? {
                      animation: `roll-in 0.1s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.04 + 0.1}s forwards`,
                      opacity: 0,
                    }
                  : {}),
              }}
            >
              <span
                className={
                  isHighlighted
                    ? "text-black bg-white px-[0.04em] pt-[0.15em] -translate-y-[0.1em] inline-block mx-[0.03em]"
                    : "text-white inline-block"
                }
                style={{
                  transform: `rotate(${rotateMap[index] || 0}deg) skew(${skewMap[index] || 0}deg) scale(${scaleMap[index] || 1})`,
                }}
              >
                {char}
              </span>
            </div>
          );
        })}
    </div>
  );
}
