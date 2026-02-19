'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateBook, useUpdateBook } from "@/hooks/useBooks";

// Zod schema for validation, matching the database schema
const formSchema = z.object({
    file_name: z.string().min(1, "File name is required"),
    book_name: z.string().nullable(),
    author_name: z.string().nullable(),
    year: z.string().nullable(),
    status: z.string().nullable(),
    source: z.string().nullable(),
    assignee: z.string().nullable(),
    stage: z.string().nullable(),
    notes: z.string().nullable(),
    language: z.string().nullable(),
    category: z.string().nullable(),
    isbn: z.string().nullable(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).nullable(),
});

export function BookForm({ book, onSave, onCancel }) {
    const createBook = useCreateBook();
    const updateBook = useUpdateBook();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: book || {
            file_name: "",
            book_name: "",
            author_name: "",
            year: "",
            status: "Pending",
            source: "",
            assignee: "",
            stage: "",
            notes: "",
            language: "Sindhi",
            category: "",
            isbn: "",
            priority: "Medium",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (book) {
            updateBook.mutate({ ...values, id: book.id });
        } else {
            createBook.mutate(values);
        }
        onSave();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="book_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Book Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter book name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="author_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Author Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter author name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="file_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>File Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter file name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a priority" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter any notes" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Form>
    );
}
