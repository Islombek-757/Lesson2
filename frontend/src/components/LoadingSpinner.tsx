export default function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  );
}
