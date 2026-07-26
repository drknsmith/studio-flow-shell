import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CLIENTS, type Client, type ClientStatus, type MembershipType } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "./StatusBadge";
import { ClientDetailDrawer } from "./ClientDetailDrawer";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: Array<{ id: "all" | ClientStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "lapsing", label: "Lapsing" },
  { id: "at-risk", label: "At risk" },
];

const MEMBERSHIPS: MembershipType[] = ["Unlimited", "10-Pack", "Drop-in", "Class Pass", "Founding"];

function daysAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400_000);
  if (diff <= 0) return "today";
  if (diff === 1) return "1 day ago";
  if (diff < 30) return `${diff} days ago`;
  return `${Math.floor(diff / 30)} mo ago`;
}

export function ClientsTable() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ClientStatus>("all");
  const [membershipFilter, setMembershipFilter] = useState<"all" | MembershipType>("all");
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return CLIENTS.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (membershipFilter !== "all" && c.membershipType !== membershipFilter) return false;
      if (query && !c.name.toLowerCase().includes(query) && !c.email.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [q, statusFilter, membershipFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
          <select
            value={membershipFilter}
            onChange={(e) => setMembershipFilter(e.target.value as MembershipType | "all")}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All memberships</option>
            {MEMBERSHIPS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            <div>Client</div>
            <div>Membership</div>
            <div>Credits</div>
            <div>Last visit</div>
            <div>Status</div>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((c) => (
              <li
                key={c.id}
                onClick={() => setSelected(c)}
                className="grid cursor-pointer grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.email}</div>
                </div>
                <div className="text-sm">{c.membershipType}</div>
                <div className="num text-sm">{c.creditsRemaining >= 999 ? "∞" : c.creditsRemaining}</div>
                <div className="text-sm text-muted-foreground">{daysAgo(c.lastVisitISO)}</div>
                <div><StatusBadge status={c.status} /></div>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile list */}
        <ul className="divide-y divide-border md:hidden">
          {filtered.map((c) => (
            <li
              key={c.id}
              onClick={() => setSelected(c)}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{c.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {c.membershipType} · {c.creditsRemaining >= 999 ? "∞" : c.creditsRemaining} credits · {daysAgo(c.lastVisitISO)}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No clients match those filters.
          </div>
        )}
      </div>

      <ClientDetailDrawer
        client={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}
