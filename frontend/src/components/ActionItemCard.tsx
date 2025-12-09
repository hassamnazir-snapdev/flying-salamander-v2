"use client";

import React, { useState } from "react";
import { ActionItem } from "@/types/meeting";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Mail, Calendar, ListTodo, FileText, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useMeetings } from "@/context/MeetingContext";
import { toast } from "sonner";
import EditActionItemDialog from "./EditActionItemDialog";
import SendEmailDialog from "./SendEmailDialog";
import CreateCalendarInviteDialog from "./CreateCalendarInviteDialog"; // Import new dialog
import AssignTaskDialog from "./AssignTaskDialog"; // Import new dialog

interface ActionItemCardProps {
  actionItem: ActionItem;
}

const ActionItemCard = ({ actionItem }: ActionItemCardProps) => {
  const { addOrUpdateActionItem, rejectActionItem } = useMeetings();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [isCreateCalendarInviteDialogOpen, setIsCreateCalendarInviteDialogOpen] = useState(false); // New state
  const [isAssignTaskDialogOpen, setIsAssignTaskDialogOpen] = useState(false); // New state


  const handleActionExecute = (type: ActionItem['proposedActionType']) => {
    switch (type) {
      case "Send Email":
        setIsSendEmailDialogOpen(true);
        break;
      case "Create Calendar Invite":
        setIsCreateCalendarInviteDialogOpen(true); // Open new dialog
        break;
      case "Assign Task":
        setIsAssignTaskDialogOpen(true); // Open new dialog
        break;
      case "Add Notes":
        // Simulate execution for Add Notes
        addOrUpdateActionItem({ ...actionItem, status: "Executed", executedAt: new Date() });
        toast.success(`Action "Add Notes" for "${actionItem.description}" executed! (Mock)`);
        break;
      default:
        // Fallback for any unhandled types
        addOrUpdateActionItem({ ...actionItem, status: "Executed", executedAt: new Date() });
        toast.success(`Action "${type}" for "${actionItem.description}" executed! (Mock)`);
        break;
    }
  };

  const handleReject = () => {
    rejectActionItem(actionItem.id);
    toast.info(`Action "${actionItem.description}" rejected.`);
  };

  const getActionIcon = (type: ActionItem['proposedActionType']) => {
    switch (type) {
      case "Send Email": return <Mail className="mr-2 h-4 w-4" />;
      case "Create Calendar Invite": return <Calendar className="mr-2 h-4 w-4" />;
      case "Assign Task": return <ListTodo className="mr-2 h-4 w-4" />;
      case "Add Notes": return <FileText className="mr-2 h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <>
      <Card className="mb-2">
        <CardContent className="p-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium text-base">{actionItem.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
              {actionItem.owner && <Badge variant="outline">{actionItem.owner}</Badge>}
              {actionItem.dueDate && (
                <Badge variant="outline">Due: {format(actionItem.dueDate, "MMM d")}</Badge>
              )}
              <Badge variant={actionItem.status === "Pending" ? "destructive" : "default"}>
                {actionItem.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {actionItem.status === "Pending" && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {getActionIcon(actionItem.proposedActionType)}
                      {actionItem.proposedActionType} <MoreVertical className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleActionExecute("Send Email")}>
                      <Mail className="mr-2 h-4 w-4" /> Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionExecute("Create Calendar Invite")}>
                      <Calendar className="mr-2 h-4 w-4" /> Create Calendar Invite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionExecute("Assign Task")}>
                      <ListTodo className="mr-2 h-4 w-4" /> Assign Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleActionExecute("Add Notes")}>
                      <FileText className="mr-2 h-4 w-4" /> Add Notes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} aria-label="Edit action">
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleReject} aria-label="Reject action">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {isEditDialogOpen && (
        <EditActionItemDialog
          actionItem={actionItem}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}

      {isSendEmailDialogOpen && (
        <SendEmailDialog
          actionItem={actionItem}
          isOpen={isSendEmailDialogOpen}
          onClose={() => setIsSendEmailDialogOpen(false)}
        />
      )}

      {isCreateCalendarInviteDialogOpen && (
        <CreateCalendarInviteDialog
          actionItem={actionItem}
          isOpen={isCreateCalendarInviteDialogOpen}
          onClose={() => setIsCreateCalendarInviteDialogOpen(false)}
        />
      )}

      {isAssignTaskDialogOpen && (
        <AssignTaskDialog
          actionItem={actionItem}
          isOpen={isAssignTaskDialogOpen}
          onClose={() => setIsAssignTaskDialogOpen(false)}
        />
      )}
    </>
  );
};

export default ActionItemCard;