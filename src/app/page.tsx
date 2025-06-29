"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const [names, setNames] = useState<string[]>([]);
  const [drawnName, setDrawnName] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [drawnNamesList, setDrawnNamesList] = useState<string[]>([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file.type !== "text/plain") {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, envie um arquivo .txt",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const nameList = text
        .split("\n")
        .map((name) => name.trim())
        .filter(Boolean);
      setNames(nameList);
      setDrawnName(null);
      setFileUploaded(true);
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
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
        setDrawnNamesList(prev => [...prev, finalName]);
        setNames(prevNames => prevNames.filter(name => name !== finalName));
        setCountdown(null); // Clear countdown
      }
    }
  }, [isDrawing, countdown, names]);

  useEffect(() => {
    if (drawnName) {
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
      });
    }
  }, [drawnName]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-24 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-teal-50 via-white to-teal-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <div className="w-full flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md space-y-4 shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Mestre do Sorteio</CardTitle>
          <CardDescription className="text-center">Envie sua lista de nomes para começar o sorteio!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!fileUploaded && (
            <Label
              htmlFor="names-file"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-2 border-2 border-dashed border-input rounded-md p-4 text-sm cursor-pointer",
                isDragging && "bg-accent/20"
              )}
            >
              <span className="text-muted-foreground">
                Arraste e solte o arquivo aqui ou clique para selecionar
              </span>
              <Input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                id="names-file"
                className="hidden"
              />
            </Label>
          )}

          {names.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Lista de Nomes:</h3>
              <ul className="list-decimal list-inside">
                {names.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </div>
          )}
          <Button
            className={cn(
              "w-full text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600",
              isDrawing ? "cursor-not-allowed opacity-75" : ""
            )}
            onClick={handleDrawName}
            disabled={names.length === 0 || isDrawing}
          >
            Sortear Nome
          </Button>

          <Dialog open={isDrawing} onOpenChange={() => {}}>
            <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center [&>button]:hidden">
              {countdown !== null && (
                <span className="text-6xl sm:text-8xl font-bold text-primary animate-pulse">
                  {countdown}
                </span>
              )}
            </DialogContent>
          </Dialog>

          {drawnName && (
            <div className="text-center mt-4 animate-fade-in">
              <h3 className="text-xl font-semibold">O vencedor é:</h3>
              <p className="text-2xl font-bold text-primary">{drawnName}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {drawnNamesList.length > 0 && (
        <Card className="w-full max-w-md space-y-4 mt-4 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nomes Sorteados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-decimal list-inside">
              {drawnNamesList.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
