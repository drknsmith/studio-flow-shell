import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { CLIENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Studio" },
      { name: "description", content: "Search, filter, and review members and their booking history." },
      { property: "og:title", content: "Clients — Studio" },
      { property: "og:description", content: "Members, memberships, credits, and history." },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <>
      <PageHeader title="Clients" subtitle={`${CLIENTS.length} members`} />
      <div className="px-4 py-6 md:px-8 md:py-8">
        <ClientsTable />
      </div>
    </>
  );
}
