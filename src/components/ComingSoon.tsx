import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        {description || "This module is under development. Check back soon for a full-featured experience."}
      </p>
    </div>
  );
}
