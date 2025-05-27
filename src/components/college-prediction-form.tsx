
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
import { Checkbox } from "@/components/ui/checkbox";
import { RANK_CATEGORIES, GENDERS, BRANCHES, ALL_BRANCHES_IDENTIFIER } from "@/lib/constants";
import type { UserInput } from "@/types";

const formSchema = z.object({
  userRank: z.coerce.number().positive({ message: "Rank must be a positive number." }),
  rankCategory: z.enum(RANK_CATEGORIES as [string, ...string[]], {
    required_error: "Please select a rank category.",
  }).refine(value => value !== "", { message: "Please select a rank category." }),
  gender: z.enum(["BOYS", "GIRLS"] as [string, ...string[]], { 
    required_error: "Please select a gender.",
  }).refine(value => value !== "", { message: "Please select a gender." }),
  branches: z.array(z.string()).refine(value => value.length > 0, { message: "Please select at least one branch or 'All Branches'." }),
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
      rankCategory: "", 
      gender: "", 
      branches: [],
      userPreferences: "",
    },
  });

  const handleFormSubmit = (values: CollegePredictionFormValues) => {
    const userInput: UserInput = {
      ...values,
      rankCategory: values.rankCategory as UserInput['rankCategory'], 
      gender: values.gender as UserInput['gender'],
      branches: values.branches,
    };
    onSubmit(userInput);
  };

  const currentSelectedBranches = form.watch("branches");

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
          {/* Branches Field - Replaces the old single Select for branch */}
          <FormField
            control={form.control}
            name="branches"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <div className="mb-2">
                  <FormLabel>Preferred Branches</FormLabel>
                  <FormDescription>
                    Select one or more branches, or choose "All Branches".
                  </FormDescription>
                </div>
                
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-3 p-2 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(ALL_BRANCHES_IDENTIFIER)}
                      onCheckedChange={(isChecked) => {
                        field.onChange(isChecked ? [ALL_BRANCHES_IDENTIFIER] : []);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    All Branches
                  </FormLabel>
                </FormItem>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                  {BRANCHES.map((branchName) => (
                    <FormItem key={branchName} className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(branchName)}
                          disabled={currentSelectedBranches?.includes(ALL_BRANCHES_IDENTIFIER)}
                          onCheckedChange={(isChecked) => {
                            const currentSelection = field.value?.filter(b => b !== ALL_BRANCHES_IDENTIFIER) || [];
                            if (isChecked) {
                              field.onChange([...currentSelection, branchName]);
                            } else {
                              field.onChange(currentSelection.filter((b) => b !== branchName));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">
                        {branchName}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
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
