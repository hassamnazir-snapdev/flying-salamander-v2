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

interface SendEmailDialogProps {
  actionItem: ActionItem;
  isOpen: boolean;
  onClose: () => void;
}

const SendEmailDialog = ({ actionItem, isOpen, onClose }: SendEmailDialogProps) => {
  const { addOrUpdateActionItem } = useMeetings();

  // Mock email details based on action item
  const mockTo = actionItem.owner ? `${actionItem.owner.toLowerCase().replace(/\s/g, '.')}@example.com` : "team@example.com";
  const mockSubject = `Follow-up: ${actionItem.description}`;
  const mockBody = `Hi ${actionItem.owner || 'Team'},\n\nThis is a follow-up regarding the action item: "${actionItem.description}".\n\nBest regards,\nSarah`;

  const handleSendEmail = () => {
    // Simulate sending email
    addOrUpdateActionItem({ ...actionItem, status: "Executed", executedAt: new Date() });
    toast.success(`Mock email sent for "${actionItem.description}"!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Draft Email</DialogTitle>
          <DialogDescription>
            Review and send this mock email for your action item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To
            </Label>
            <Input id="to" value={mockTo} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input id="subject" value={mockSubject} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="body" className="text-right pt-2">
              Body
            </Label>
            <Textarea id="body" value={mockBody} className="col-span-3 h-32" readOnly />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSendEmail}>Send Email (Mock)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailDialog;