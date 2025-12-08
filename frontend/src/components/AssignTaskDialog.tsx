"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionItem } from "@/types/meeting";
import { useMeetings } from "@/context/MeetingContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext"; // To check connected integrations

interface AssignTaskDialogProps {
  actionItem: ActionItem;
  isOpen: boolean;
  onClose: () => void;
}

const AssignTaskDialog = ({ actionItem, isOpen, onClose }: AssignTaskDialogProps) => {
  const { addOrUpdateActionItem } = useMeetings();
  const { integrationStatus } = useAuth();

  // Determine target integration based on what's connected, Notion preferred if both
  const targetIntegration = integrationStatus.notion ? "Notion" : integrationStatus.granola ? "Granola" : "None";

  // Mock task details
  const mockTaskDescription = actionItem.description;
  const mockTaskOwner = actionItem.owner || "You";
  const mockTaskDueDate = actionItem.dueDate ? format(actionItem.dueDate, "PPP") : "No due date";

  const handleAssignTask = () => {
    if (targetIntegration === "None") {
      toast.error("Please connect Notion or Granola in settings to assign tasks.");
      return;
    }
    // Simulate assigning task
    addOrUpdateActionItem({ ...actionItem, status: "Executed", executedAt: new Date() });
    toast.success(`Mock task assigned to ${targetIntegration} for "${actionItem.description}"!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
          <DialogDescription>
            Review and assign this mock task to your connected integration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskDescription" className="text-right">
              Task
            </Label>
            <Textarea id="taskDescription" value={mockTaskDescription} className="col-span-3 h-20" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="owner" className="text-right">
              Owner
            </Label>
            <Input id="owner" value={mockTaskOwner} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <Input id="dueDate" value={mockTaskDueDate} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="integration" className="text-right">
              To
            </Label>
            <Input id="integration" value={targetIntegration} className="col-span-3" readOnly />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAssignTask} disabled={targetIntegration === "None"}>
            Assign Task (Mock)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTaskDialog;