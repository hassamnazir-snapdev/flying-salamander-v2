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

interface CreateCalendarInviteDialogProps {
  actionItem: ActionItem;
  isOpen: boolean;
  onClose: () => void;
}

const CreateCalendarInviteDialog = ({ actionItem, isOpen, onClose }: CreateCalendarInviteDialogProps) => {
  const { addOrUpdateActionItem, meetings } = useMeetings();

  // Find the related meeting to get participants and times
  const relatedMeeting = actionItem.meetingId ? meetings.find(m => m.id === actionItem.meetingId) : undefined;

  // Mock invite details based on action item and related meeting
  const mockTitle = `Follow-up: ${actionItem.description}`;
  const mockStartTime = actionItem.dueDate || relatedMeeting?.endTime || new Date();
  const mockEndTime = new Date(mockStartTime.getTime() + 60 * 60 * 1000); // 1 hour after start
  const mockParticipants = relatedMeeting?.participants.join(', ') || "team@example.com";
  const mockDescription = `This invite is for the action item: "${actionItem.description}".\n\nOriginally discussed in: ${relatedMeeting?.title || 'a meeting'}.`;

  const handleCreateInvite = () => {
    // Simulate creating calendar invite
    addOrUpdateActionItem({ ...actionItem, status: "Executed", executedAt: new Date() });
    toast.success(`Mock calendar invite created for "${actionItem.description}"!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Calendar Invite</DialogTitle>
          <DialogDescription>
            Review and create this mock calendar invite for your action item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={mockTitle} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input id="startTime" value={format(mockStartTime, "PPP p")} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input id="endTime" value={format(mockEndTime, "PPP p")} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="participants" className="text-right">
              Participants
            </Label>
            <Input id="participants" value={mockParticipants} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea id="description" value={mockDescription} className="col-span-3 h-32" readOnly />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateInvite}>Create Invite (Mock)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCalendarInviteDialog;