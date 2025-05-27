
import type { PredictionResult } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, BookOpen, Users, DollarSign, TrendingUp, CheckCircle, Info } from "lucide-react";

interface CollegeResultDisplayProps {
  result: PredictionResult;
}

export function CollegeResultDisplay({ result }: CollegeResultDisplayProps) {
  if (result.error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  if (!result.college) {
    return (
      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>No Prediction Yet</AlertTitle>
        <AlertDescription>Please fill out the form above to find a college.</AlertDescription>
      </Alert>
    );
  }

  const { college, analysis, summary } = result;

  return (
    <div className="mt-8 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <CheckCircle className="mr-2 h-7 w-7 text-accent" /> Predicted College Fit
          </CardTitle>
          <CardDescription>Based on your inputs, this college might be a good fit for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-xl font-semibold">{college.collegeName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Location: {college.location.place}, {college.location.district}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Branch: {college.branchName}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Tuition Fee: {college.tuitionFee} INR</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Cutoff Rank ({college.rankCategoryUsed}): <Badge variant="secondary">{college.parsedCutoffRankDisplay}</Badge></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary?.summary && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <Info className="mr-2 h-6 w-6" /> AI-Powered College Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary.summary}</p>
          </CardContent>
        </Card>
      )}

      {analysis?.analysis && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <TrendingUp className="mr-2 h-6 w-6" /> AI Rank Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.analysis}</p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">This analysis considers historical trends for your rank category, gender, and branch.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
