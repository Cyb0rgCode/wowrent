export function StarRating({
  rating,
  count,
  size = "md",
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(rating * 2) / 2;
  const text = size === "sm" ? "text-xs" : "text-sm";
  const star = size === "sm" ? "text-sm" : "text-base";

  return (
    <span className={`inline-flex items-center gap-1 ${text} text-gray-600`}>
      <span className={`${star} leading-none text-amber-500`} aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i}>{i <= rounded ? "★" : "☆"}</span>
        ))}
      </span>
      {count !== undefined ? (
        <span className="text-gray-500">
          {rating > 0 ? rating.toFixed(1) : "New"}
          {count > 0 ? ` (${count})` : ""}
        </span>
      ) : (
        <span className="text-gray-500">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
