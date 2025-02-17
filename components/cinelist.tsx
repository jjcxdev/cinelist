// src/components/cinelist.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface CineListItem {
  id: string;
  title: string;
  is_completed: boolean;
}

interface CineListProps {
  items: CineListItem[];
}

export default function CineList({ items }: CineListProps) {
  const handleCompleteToggle = async (id: string, is_completed: boolean) => {
    try {
      await fetch(`/api/cine-list-items`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_completed }),
      });
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  return (
    <div>
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <label
              htmlFor={`complete-${item.id}`}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`complete-${item.id}`}
                checked={item.is_completed}
                onCheckedChange={(checked) =>
                  handleCompleteToggle(item.id, checked === true)
                }
              />
              <span>Complete</span>
            </label>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
