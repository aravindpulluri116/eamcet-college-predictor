
import type { PredictionResult, PredictedCollege } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, BookOpen, Users, DollarSign, TrendingUp, CheckCircle, Info, ListChecks, Code } from "lucide-react";

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

  if (!result.colleges || result.colleges.length === 0) {
    return (
      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>No Suitable Colleges Found</AlertTitle>
        <AlertDescription>No colleges matched your criteria. Please try adjusting your rank or preferences.</AlertDescription>
      </Alert>
    );
  }

  const { colleges, analysis, summary } = result;

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold mb-4 text-center flex items-center justify-center">
        <ListChecks className="mr-2 h-6 w-6 text-primary" />
        {colleges.length === 1 ? "Your Predicted College Match" : `Your Top ${colleges.length} College Matches`}
      </h3>
      
      {colleges.map((college, index) => (
        <Card key={`${college.instCode}-${college.branchName}-${index}`} className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl text-primary flex items-center">
              {index === 0 && <CheckCircle className="mr-2 h-6 w-6 md:h-7 md:w-7 text-accent flex-shrink-0" />}
              <span className="flex-grow">{`${index + 1}. ${college.collegeName}`}</span>
            </CardTitle>
            {index === 0 && <CardDescription>This is the top predicted college based on your inputs.</CardDescription>}
            {index > 0 && <CardDescription>Another potential match for you.</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start">
                <Code className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="flex-grow">EAMCET Code: <Badge variant="outline">{college.instCode}</Badge></span>
              </div>
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="flex-grow">Branch: {college.branchName}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="flex-grow">Location: {college.location.place}, {college.location.district}</span>
              </div>
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="flex-grow">Tuition Fee: {college.tuitionFee} INR</span>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="flex-grow">Cutoff Rank ({college.rankCategoryUsed}): <Badge variant="secondary">{college.parsedCutoffRankDisplay}</Badge></span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {summary?.summary && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <Info className="mr-2 h-6 w-6" /> AI-Powered Summary for Top Match
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
              <TrendingUp className="mr-2 h-6 w-6" /> AI Rank Trend Analysis for Top Match Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.analysis}</p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">This analysis considers historical trends for your rank category, gender, and the branch of the top predicted college.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
