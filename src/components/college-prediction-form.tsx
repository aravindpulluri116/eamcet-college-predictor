
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RANK_CATEGORIES, GENDERS, BRANCHES, ALL_BRANCHES_IDENTIFIER } from "@/lib/constants";
import type { UserInput } from "@/types";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  userRank: z.coerce.number().positive({ message: "Rank must be a positive number." }),
  rankCategory: z.enum(RANK_CATEGORIES as [string, ...string[]], {
    required_error: "Please select a rank category.",
  }).refine(value => value !== "", { message: "Please select a rank category." }),
  gender: z.enum(GENDERS.map(g => g.value) as [string, ...string[]], {
    required_error: "Please select a gender.",
  }).refine(value => value !== "", { message: "Please select a gender." }),
  branches: z.array(z.string()).refine(value => value.length > 0, { message: "Please select at least one branch or 'All Branches'." }),
});

type CollegePredictionFormValues = z.infer<typeof formSchema>;

interface CollegePredictionFormProps {
  onSubmit: (data: UserInput) => Promise<void>;
  isLoading: boolean;
}

export function CollegePredictionForm({ onSubmit, isLoading }: CollegePredictionFormProps) {
  const { toast } = useToast();
  const form = useForm<CollegePredictionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userRank: undefined,
      rankCategory: "",
      gender: "",
      branches: [],
    },
  });

  const handleFormSubmit = (values: CollegePredictionFormValues) => {
    const userInput: UserInput = {
      ...values,
    };
    onSubmit(userInput);
  };

  const handleValidationErrors = (errors: FieldErrors<CollegePredictionFormValues>) => {
    if (errors.rankCategory) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errors.rankCategory.message || "Please select a rank category.",
      });
    }
    if (errors.branches) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: errors.branches.message || "Please select at least one branch.",
      });
    }
     // You can add more specific toasts for other fields if needed
  };

  const selectedBranches = form.watch("branches");

  const getBranchButtonLabel = () => {
    if (selectedBranches.length === 0) return "Select Branches";
    if (selectedBranches.includes(ALL_BRANCHES_IDENTIFIER)) return "All Branches";
    if (selectedBranches.length === 1) return selectedBranches[0];
    return `${selectedBranches.length} Branches Selected`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit, handleValidationErrors)} className="space-y-8">
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
                <Select onValueChange={field.onChange} value={field.value || ""}>
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
                <Select onValueChange={field.onChange} value={field.value || ""}>
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
            name="branches"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <div className="mb-2">
                  <FormLabel>Preferred Branches</FormLabel>
                  <FormDescription>
                    Select one or more branches, or choose "All Branches".
                  </FormDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {getBranchButtonLabel()}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-80 overflow-y-auto">
                    <DropdownMenuLabel>Select Branches</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={selectedBranches.includes(ALL_BRANCHES_IDENTIFIER)}
                      onCheckedChange={(isChecked) => {
                        field.onChange(isChecked ? [ALL_BRANCHES_IDENTIFIER] : []);
                      }}
                      onSelect={(e) => e.preventDefault()} // Keep menu open
                    >
                      All Branches
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {BRANCHES.map((branchName) => (
                      <DropdownMenuCheckboxItem
                        key={branchName}
                        checked={selectedBranches.includes(branchName)}
                        disabled={selectedBranches.includes(ALL_BRANCHES_IDENTIFIER)}
                        onCheckedChange={(isChecked) => {
                          const currentSelection = field.value?.filter(b => b !== ALL_BRANCHES_IDENTIFIER) || [];
                          if (isChecked) {
                            field.onChange([...currentSelection, branchName]);
                          } else {
                            field.onChange(currentSelection.filter((b) => b !== branchName));
                          }
                        }}
                        onSelect={(e) => e.preventDefault()} // Keep menu open
                      >
                        {branchName}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Predicting..." : "Predict College"}
        </Button>
      </form>
    </Form>
  );
}
