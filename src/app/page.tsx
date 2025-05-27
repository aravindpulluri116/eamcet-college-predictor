
"use client";

import { useState } from "react";
import type { UserInput, PredictionResult } from "@/types";
import { CollegePredictionForm } from "@/components/college-prediction-form";
import { CollegeResultDisplay } from "@/components/college-result-display";
import { getCollegePrediction } from "@/app/actions";
import { SiteHeader } from "@/components/site-header";
import { LoadingSpinner } from "@/components/loader";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, Linkedin } from "lucide-react";

export default function HomePage() {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: UserInput) => {
    setIsLoading(true);
    setPredictionResult(null); // Clear previous results
    try {
      const result = await getCollegePrediction(data);
      setPredictionResult(result);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Prediction Error",
          description: result.error,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage = "Failed to get prediction. Please try again.";
      setPredictionResult({ error: errorMessage });
      toast({
        variant: "destructive",
        title: "An Unexpected Error Occurred",
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <section aria-labelledby="form-section-title" className="mb-12 animate-fade-in-up">
            <Card className="shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl">
              <CardHeader className="text-center">
                <CardTitle id="form-section-title" className="text-3xl font-bold tracking-tight text-primary mb-2">
                  Find Your Ideal College
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your TGEAPCET-2024 rank details and preferences to predict your best college match.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CollegePredictionForm onSubmit={handleFormSubmit} isLoading={isLoading} />
              </CardContent>
            </Card>
          </section>

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-2 mt-10 animate-fade-in-up">
              <LoadingSpinner size={32}/>
              <p className="text-muted-foreground">Analyzing data and predicting your college...</p>
            </div>
          )}

          {predictionResult && !isLoading && (
            <>
            <Separator className="my-8" />
            <section aria-labelledby="results-section-title" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 id="results-section-title" className="text-2xl font-semibold tracking-tight text-center mb-6">
                Prediction Results
              </h2>
              <CollegeResultDisplay result={predictionResult} />
            </section>
            </>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} EAMCET College Predictor. All rights reserved.</p>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
            <a
              href="https://www.instagram.com/techy.aravind/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center md:justify-start"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
              <span className="ml-2">Techy Aravind</span>
            </a>
            <a
              href="https://www.linkedin.com/in/aravind-pulluri-101291334/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center md:justify-start"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
              <span className="ml-2">Aravind Pulluri</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
