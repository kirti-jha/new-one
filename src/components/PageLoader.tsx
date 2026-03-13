export default function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </div>
  );
}

