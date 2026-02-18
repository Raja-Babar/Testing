import supabase from '@/lib/supabaseClient';

export class AutomationEngine {
  static async executeRules(triggerType, context = {}) {
    try {
      // Fetch active rules for this trigger type
      const { data: allRules, error } = await supabase.from('automation_rules').select('*').order('priority', { ascending: false });
      if (error) throw error;
      const rules = (allRules || []).filter(r => r.is_active && r.trigger_type === triggerType);

      for (const rule of rules) {
        // Check if rule conditions match
        if (this.checkConditions(rule, context)) {
          await this.executeAction(rule, context);
        }
      }
    } catch (error) {
      console.error("Automation execution error:", error);
    }
  }

  static checkConditions(rule, context) {
    switch (rule.trigger_type) {
      case "stage_complete":
        return context.completedStage === rule.trigger_stage;
      
      case "pages_threshold":
        return context.pagesCount >= rule.trigger_pages_count;
      
      case "book_created":
        return true;
      
      case "daily_check":
        return true;
      
      default:
        return false;
    }
  }

  static async executeAction(rule, context) {
    const { book } = context;
    if (!book) return;

    try {
      switch (rule.action_type) {
        case "assign_to_stage":
          await supabase.from('digitization_records').update({
            stage: rule.action_target_stage,
            status: "In Progress"
          }).eq('id', book.id);
          break;

        case "assign_to_employee":
          const assignmentField = this.getAssignmentField(book.current_stage);
          if (assignmentField) {
            await supabase.from('digitization_records').update({
              [assignmentField]: rule.action_employee_email
            }).eq('id', book.id);
          }
          break;

        case "send_notification":
          const message = this.formatMessage(rule.action_notification_message, context);
          
          // Get all assigned employees for this book
          const recipients = [
            book.assigned_to_scanning,
            book.assigned_to_digitization,
            book.assigned_to_checking,
            book.assigned_to_uploading
          ].filter(Boolean);

          // Send to all assigned employees
          const notifications = [];
          for (const email of [...new Set(recipients)]) {
            const employee = context.employees?.find(e => e.email === email);
            notifications.push({
              recipient_email: email,
              recipient_name: employee?.full_name || email,
              title: `Automation: ${rule.name}`,
              message: message,
              type: "info",
              book_id: book.id,
              book_title: book.title,
              is_read: false
            });
          }
          if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications);
          }
          break;

        case "update_status":
          await supabase.from('digitization_records').update({ status: "In Progress" }).eq('id', book.id);
          break;
      }
    } catch (error) {
      console.error("Action execution error:", error);
    }
  }

  static getAssignmentField(stage) {
    const map = {
      "Scanning": "assigned_to_scanning",
      "Digitization": "assigned_to_digitization",
      "Checking": "assigned_to_checking",
      "Uploading": "assigned_to_uploading"
    };
    return map[stage];
  }

  static formatMessage(template, context) {
    if (!template) return "";
    let message = template;
    message = message.replace(/{book_title}/g, context.book?.title || "Unknown");
    message = message.replace(/{stage}/g, context.completedStage || context.book?.current_stage || "");
    message = message.replace(/{pages}/g, context.pagesCount || 0);
    return message;
  }
}