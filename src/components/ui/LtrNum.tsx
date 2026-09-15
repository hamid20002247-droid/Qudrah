type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Keep "1 / 60" readable in RTL layouts. */
export function LtrNum({ children, className = "" }: Props) {
  return (
    <span dir="ltr" className={`inline-block tabular-nums ${className}`}>
      {children}
    </span>
  );
}
