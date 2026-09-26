import { SkeletonTable } from "@/components/ui/skeleton-table";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your organization&apos;s teams, roles, and staff members.
        </p>
      </div>
      <SkeletonTable columns={5} rows={5} />
    </div>
  );
}
