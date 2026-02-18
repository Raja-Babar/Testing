import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function AutomationRuleDialog({ open, onClose, rule, employees, onSave, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    trigger_type: "stage_complete",
    trigger_stage: "",
    trigger_pages_count: "",
    action_type: "send_notification",
    action_target_stage: "",
    action_employee_email: "",
    action_notification_message: "",
    is_active: true,
    priority: 5
  });

  useEffect(() => {
    if (rule) {
      setForm(rule);
    } else if (open) {
      setForm({
        name: "",
        description: "",
        trigger_type: "stage_complete",
        trigger_stage: "",
        trigger_pages_count: "",
        action_type: "send_notification",
        action_target_stage: "",
        action_employee_email: "",
        action_notification_message: "",
        is_active: true,
        priority: 5
      });
    }
  }, [rule, open]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (data.trigger_type !== "stage_complete") delete data.trigger_stage;
    if (data.trigger_type !== "pages_threshold") delete data.trigger_pages_count;
    if (data.action_type !== "assign_to_stage") delete data.action_target_stage;
    if (data.action_type !== "assign_to_employee") delete data.action_employee_email;
    if (data.action_type !== "send_notification") delete data.action_notification_message;
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit Rule" : "New Automation Rule"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="space-y-1.5">
            <Label>Rule Name *</Label>
            <Input value={form.name} onChange={e => handleChange("name", e.target.value)} required placeholder="e.g. Auto-assign after scanning" />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => handleChange("description", e.target.value)} placeholder="Optional description" rows={2} />
          </div>

          {/* Trigger */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm text-slate-700 mb-3">TRIGGER (When)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Trigger Type *</Label>
                <Select value={form.trigger_type} onValueChange={v => handleChange("trigger_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stage_complete">Stage Completed</SelectItem>
                    <SelectItem value="pages_threshold">Pages Threshold Reached</SelectItem>
                    <SelectItem value="book_created">Book Created</SelectItem>
                    <SelectItem value="daily_check">Daily Check (Overdue)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.trigger_type === "stage_complete" && (
                <div className="space-y-1.5">
                  <Label>Which Stage? *</Label>
                  <Select value={form.trigger_stage} onValueChange={v => handleChange("trigger_stage", v)}>
                    <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                    <SelectContent>
                      {["Scanning", "Digitization", "Checking", "Uploading"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.trigger_type === "pages_threshold" && (
                <div className="space-y-1.5">
                  <Label>Pages Count *</Label>
                  <Input type="number" min={1} value={form.trigger_pages_count} onChange={e => handleChange("trigger_pages_count", parseInt(e.target.value))} placeholder="e.g. 100" />
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm text-slate-700 mb-3">ACTION (Then)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Action Type *</Label>
                <Select value={form.action_type} onValueChange={v => handleChange("action_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assign_to_stage">Move to Next Stage</SelectItem>
                    <SelectItem value="assign_to_employee">Assign to Employee</SelectItem>
                    <SelectItem value="send_notification">Send Notification</SelectItem>
                    <SelectItem value="update_status">Update Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.action_type === "assign_to_stage" && (
                <div className="space-y-1.5">
                  <Label>Target Stage *</Label>
                  <Select value={form.action_target_stage} onValueChange={v => handleChange("action_target_stage", v)}>
                    <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                    <SelectContent>
                      {["Scanning", "Digitization", "Checking", "Uploading"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.action_type === "assign_to_employee" && (
                <div className="space-y-1.5">
                  <Label>Employee *</Label>
                  <Select value={form.action_employee_email} onValueChange={v => handleChange("action_employee_email", v)}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.email} value={emp.email}>{emp.full_name || emp.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {form.action_type === "send_notification" && (
              <div className="space-y-1.5 mt-4">
                <Label>Notification Message *</Label>
                <Textarea 
                  value={form.action_notification_message} 
                  onChange={e => handleChange("action_notification_message", e.target.value)} 
                  placeholder="Message template (use {book_title}, {stage})"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority (1-10)</Label>
              <Input type="number" min={1} max={10} value={form.priority} onChange={e => handleChange("priority", parseInt(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : (rule ? "Update Rule" : "Create Rule")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}