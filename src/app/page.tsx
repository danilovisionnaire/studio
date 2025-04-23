"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [names, setNames] = useState<string[]>([]);
  const [drawnName, setDrawnName] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const nameList = text.split("\n").map((name) => name.trim()).filter(Boolean);
      setNames(nameList);
      setDrawnName(null); // Clear any previously drawn name
    };
    reader.readAsText(file);
  }, []);

  const handleDrawName = useCallback(() => {
    if (names.length === 0 || isDrawing) {
      return;
    }

    setIsDrawing(true);
    setDrawnName(null);
    setCountdown(5); // Start countdown from 5

  }, [names, isDrawing]);

  // Countdown effect
  useEffect(() => {
    if (isDrawing && countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Countdown finished, select the final drawn name
        const finalName = names[Math.floor(Math.random() * names.length)];
        setDrawnName(finalName);
        setIsDrawing(false);
        setNames(prevNames => prevNames.filter(name => name !== finalName));
        setCountdown(null); // Clear countdown
      }
    }
  }, [isDrawing, countdown, names]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-24 sm:py-32 px-8 sm:px-12">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Lucky Draw Master</CardTitle>
          <CardDescription className="text-center">Upload your list of names to start the draw!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="names-file">File Names</Label>
          <Input type="file" accept=".txt" onChange={handleFileChange} id="names-file" />
          {names.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Names List:</h3>
              <ul className="list-disc list-inside">
                {names.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </div>
          )}
          <Button
            className={cn("w-full bg-accent text-primary-foreground hover:bg-accent-foreground hover:text-accent", isDrawing ? "cursor-not-allowed opacity-75" : "")}
            onClick={handleDrawName}
            disabled={names.length === 0 || isDrawing}
          >
            {isDrawing ? (countdown ? `Drawing in ${countdown}...` : "Drawing...") : "Draw Name"}
          </Button>
          {drawnName && (
            <div className="text-center mt-4">
              <h3 className="text-xl font-semibold">The winner is:</h3>
              <p className="text-2xl font-bold text-primary">{drawnName}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
