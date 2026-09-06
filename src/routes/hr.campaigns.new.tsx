import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCampaign } from "@/api/campaigns";
import { listEmployees } from "@/api/employees";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/hr/campaigns/new")({
  head: () => ({
    meta: [
      { title: "New campaign — Exit Interview Platform" },
      { name: "description", content: "Create an exit interview campaign and choose which leavers to invite." },
      { property: "og:title", content: "New campaign — Exit Interview Platform" },
      { property: "og:description", content: "Create an exit interview campaign and choose which leavers to invite." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewCampaignPage,
});

function NewCampaignPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const employees = useQuery({
    queryKey: ["hr", "employees", { limit: 100 }],
    queryFn: () => listEmployees({ page: 1, limit: 100 }),
  });

  const mutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: (campaign) => {
      void queryClient.invalidateQueries({ queryKey: ["hr", "campaigns"] });
      toast.success("Campaign created");
      navigate({ to: "/hr/campaigns/$id", params: { id: campaign.id } });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Could not create the campaign.";
      setError(message);
      toast.error(message);
    },
  });

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Give the campaign a name.");
    if (!startAt || !endAt) return setError("Choose a start and end date.");
    if (new Date(endAt) <= new Date(startAt)) return setError("The end date must be after the start date.");
    if (selected.length === 0) return setError("Select at least one employee to invite.");
    mutation.mutate({
      name: name.trim(),
      description: description.trim(),
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      instructions: instructions.trim() || undefined,
      employee_ids: selected,
    });
  };

  const items = employees.data?.items ?? [];

  return (
    <>
      <PageHeader title="New campaign" description="Set the window, the message and who receives it." />

      <form className="grid gap-4 lg:grid-cols-[1fr_380px]" onSubmit={submit}>
        <section className="panel space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="June 2026 Exit Interviews" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this campaign covers"
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">Starts</Label>
              <Input id="start" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Ends</Label>
              <Input id="end" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions for employees</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Shown on the employee interview screen"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create campaign"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/hr/campaigns" })}>
              Cancel
            </Button>
          </div>
        </section>

        <section className="panel flex max-h-[640px] flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Select employees</h2>
            <span className="text-xs text-muted-foreground">{selected.length} selected</span>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {employees.isLoading && <p className="text-sm text-muted-foreground">Loading employees…</p>}
            {items.map((e) => (
              <label
                key={e.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
              >
                <Checkbox checked={selected.includes(e.id)} onCheckedChange={() => toggle(e.id)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{e.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {e.department} · leaves {formatDate(e.last_working_date)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      </form>
    </>
  );
}
