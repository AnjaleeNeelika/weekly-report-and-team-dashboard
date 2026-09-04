import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewUserFormData } from "@/types/user";
import { useState } from "react";
import { createUser } from "@/data/user/data";
import { toast } from "sonner";

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (val: boolean) => void;
} 

const userRole = [
  { label: "Manager", value: "manager" },
  { label: "Team Member", value: "team_member" },
];

export default function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
    const [formDetails, setFormDetails] = useState<NewUserFormData>({
        first_name: "",
        last_name: "",
        email: "",
        role: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const updateField = (field: keyof NewUserFormData, value: string) => {
        setFormDetails((current) => ({ ...current, [field]: value }));
    };

    const handleCreate = async () => {
        if (!formDetails.first_name || !formDetails.last_name || !formDetails.email || !formDetails.role) {
            toast.error("Complete all fields before creating the user.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await createUser(formDetails);
            setGeneratedLink(response.setup_url);
            setFormDetails({ first_name: "", last_name: "", email: "", role: "" });
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to create user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Enter the details of the new member</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                        <Label>First Name</Label>
                        <Input value={formDetails.first_name} onChange={(event) => updateField("first_name", event.target.value)} placeholder="Enter the first name" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Last Name</Label>
                        <Input value={formDetails.last_name} onChange={(event) => updateField("last_name", event.target.value)} placeholder="Enter the last name" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Email</Label>
                        <Input type="email" value={formDetails.email} onChange={(event) => updateField("email", event.target.value)} placeholder="Enter the email" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>User Role</Label>
                        <Select value={formDetails.role || undefined} onValueChange={(value) => updateField("role", value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    {userRole.map((role, i) => (
                                        <SelectItem key={i} value={role.value}>{role.label}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button onClick={handleCreate} disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={generatedLink !== null} onOpenChange={(isOpen) => !isOpen && setGeneratedLink(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>User created</DialogTitle>
                    <DialogDescription>Share this one-time link with the new user so they can set their password.</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2">
                    <Input value={generatedLink ?? ""} readOnly />
                    <Button
                        type="button"
                        onClick={async () => {
                            if (!generatedLink) return;
                            await navigator.clipboard.writeText(generatedLink);
                            toast.success("Setup link copied.");
                        }}
                    >
                        Copy
                    </Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Done</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}