import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  language: z.string().min(1, "Language is required"),
  description: z.string().min(10, "Please provide a detailed description"),
  example: z.string().optional(),
});

type SearchFormProps = {
  onSearch: (data: z.infer<typeof formSchema>) => void;
};

export function SearchForm({ onSearch }: SearchFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: "",
      description: "",
      example: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSearch)} className="space-y-6">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Programming Language</FormLabel>
              <FormControl>
                <Input placeholder="e.g. JavaScript, Python, Go" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Functionality Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Describe what you're looking for..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="example"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Example Library (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. express, requests, gin"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Find Libraries
        </Button>
      </form>
    </Form>
  );
}
