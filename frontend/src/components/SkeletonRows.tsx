export function SkeletonRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-border">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <div
                className="h-3.5 animate-pulse rounded bg-surface-alt"
                style={{ width: `${55 + ((r * 13 + c * 27) % 35)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
