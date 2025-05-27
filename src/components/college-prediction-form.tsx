
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RANK_CATEGORIES, GENDERS, BRANCHES } from "@/lib/constants";
import type { UserInput } from "@/types";

const formSchema = z.object({
  userRank: z.coerce.number().positive({ message: "Rank must be a positive number." }),
  rankCategory: z.enum(RANK_CATEGORIES as [string, ...string[]], {
    required_error: "Please select a rank category.",
  }).refine(value => value !== "", { message: "Please select a rank category." }),
  gender: z.enum(["BOYS", "GIRLS"] as [string, ...string[]], { // Added [string, ...string[]] type assertion for Zod enum with non-empty array
    required_error: "Please select a gender.",
  }).refine(value => value !== "", { message: "Please select a gender." }),
  branch: z.string().min(1, { message: "Please select or enter a branch." }),
  userPreferences: z.string().min(10, { message: "Please describe your preferences (min 10 characters)." }).max(500, { message: "Preferences cannot exceed 500 characters." }),
});

type CollegePredictionFormValues = z.infer<typeof formSchema>;

interface CollegePredictionFormProps {
  onSubmit: (data: UserInput) => Promise<void>;
  isLoading: boolean;
}

export function CollegePredictionForm({ onSubmit, isLoading }: CollegePredictionFormProps) {
  const form = useForm<CollegePredictionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userRank: undefined, 
      rankCategory: "", // Initialize with empty string
      gender: "", // Initialize with empty string
      branch: "",
      userPreferences: "",
    },
  });

  const handleFormSubmit = (values: CollegePredictionFormValues) => {
    // Ensure rankCategory and gender are correctly typed for UserInput
    const userInput: UserInput = {
      ...values,
      // Zod schema ensures these are valid non-empty strings if form is valid
      rankCategory: values.rankCategory as UserInput['rankCategory'], 
      gender: values.gender as UserInput['gender'],
    };
    onSubmit(userInput);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="userRank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Rank</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter your TGEAPCET rank"
                    {...field}
                    value={field.value ?? ''} 
                  />
                </FormControl>
                <FormDescription>
                  Your overall rank in the TGEAPCET exam.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rankCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rank Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your rank category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RANK_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Branch</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <FormDescription>
                  Choose from the list. If not available, type it. The data is limited to listed branches.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="userPreferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Preferences</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., I prefer colleges in Hyderabad, with good placement records, and lower fees."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Help us understand what you're looking for in a college (location, fees, courses, etc.). This will be used for AI-powered summary.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Predicting..." : "Predict College"}
        </Button>
      </form>
    </Form>
  );
}
