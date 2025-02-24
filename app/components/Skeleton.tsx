// components/Skeleton.tsx
export default function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{
            width: `${Math.random() * 50 + 50}%`, // Width between 50% and 100%
            backgroundColor: i % 2 === 0 ? 'bg-gray-300' : 'bg-gray-200' // Alternate colors
          }}
        />
      ))}
    </div>
  );
}
