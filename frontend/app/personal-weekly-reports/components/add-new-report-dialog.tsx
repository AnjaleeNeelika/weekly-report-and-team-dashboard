import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddNewReportDialogProps {
    open: boolean;
    onOpenChange: (s: boolean) => void;
}

export default function AddNewReportDialog({ open, onOpenChange }: AddNewReportDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle>Add New Report</DialogTitle>
                <DialogDescription></DialogDescription>
            </DialogHeader>
        </Dialog>
    );
}