"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [names, setNames] = useState<string[]>([]);
  const [drawnName, setDrawnName] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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

  const handleDrawName = useCallback(async () => {
    if (names.length === 0 || isDrawing) {
      return;
    }

    setIsDrawing(true);
    setDrawnName(null); // Clear previously drawn name immediately

    // Simulate a drawing effect
    const getRandomName = () => names[Math.floor(Math.random() * names.length)];
    let currentName = "";
    const animationDuration = 1500; // Total animation duration
    const steps = 20; // Number of steps in the animation
    const stepDuration = animationDuration / steps;

    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
      currentName = getRandomName();
      setDrawnName(currentName); // Update the displayed name
    }

    // After the animation, set the final drawn name and remove it from the list
    setTimeout(() => {
      setDrawnName(currentName);
      setIsDrawing(false);
       setNames(prevNames => prevNames.filter(name => name !== currentName));
    }, 500);
  }, [names, isDrawing]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-24 sm:py-32 px-8 sm:px-12">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Lucky Draw Master</CardTitle>
          <CardDescription className="text-center">Upload your list of names to start the draw!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <Label htmlFor="names-file">File Names</Label>
          <Input type="file" accept=".txt" onChange={handleFileChange} id="names-file"/>
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
            {isDrawing ? "Drawing..." : "Draw Name"}
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
