"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import UserDetailsTable from "./components/user-details-table";
import { Button } from "@/components/ui/button";
import AddUserDialog from "./components/add-user-dialog";

const userRole = [
  { label: "All roles", value: "all" },
  { label: "Manager", value: "manager" },
  { label: "Team Member", value: "team_member" },
];

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isAddClicked, setIsAddClicked] = useState(false);
  const canAccessAdminPanel =
    user?.role === "admin" || user?.role === "manager";
  const selectedRoleLabel = userRole.find(
    (role) => role.value === selectedRole,
  )?.label;

  useEffect(() => {
    if (!isLoading && !canAccessAdminPanel) {
      router.replace("/dashboard");
    }
  }, [canAccessAdminPanel, isLoading, router]);

  if (isLoading || !canAccessAdminPanel) {
    return null;
  }

  return (
    <div className="flex-1 w-full p-6 space-y-6 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Overview of users and management
        </p>
      </div>

      <Card className="py-5 px-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="flex w-full max-w-[600px] gap-2 items-center">
              <Search className="text-muted-foreground/70 h-5 w-5" />
              <Input
                className="w-auto max-w-[600px]"
                size={32}
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            {user.role === "admin" && (
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filter by user role">
                    {selectedRoleLabel ?? "Filter by user role"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  sideOffset={4}
                  align="start"
                  className="min-w-44"
                  position="popper"
                >
                  <SelectGroup>
                    {userRole.map((role, i) => (
                      <SelectItem key={i} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
          <Button
            className="flex gap-1 items-center justify-center cursor-pointer"
            onClick={() => setIsAddClicked(true)}
          >
            <Plus />
            Add New Member
          </Button>
        </div>
      </Card>

      <UserDetailsTable searchTerm={searchTerm} selectedRole={selectedRole} />

      <AddUserDialog open={isAddClicked} onOpenChange={setIsAddClicked} />
    </div>
  );
}
