"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  InspectionChecklist,
  inspectionChecklistTemplate,
  type ChecklistCategory,
} from "./InspectionChecklist";
import { submitReport } from "@/lib/inspectorApi";
import { uploadPhotos } from "@/lib/mediaApi";

// The backend requires these before it accepts a report.
const MIN_PHOTOS = 3;
const MIN_NOTES_LENGTH = 20;

interface ReportSubmitFormProps {
  jobId: string;
  propertyTitle: string;
  onSubmitted?: () => void;
  onError?: (error: Error) => void;
}

const CONDITION_MAP: Record<string, "A" | "B" | "C" | "D"> = {
  excellent: "A",
  good: "B",
  fair: "C",
  poor: "D",
};

export function ReportSubmitForm({ jobId, propertyTitle, onSubmitted, onError }: ReportSubmitFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  // One preview URL per selected file, released when the selection changes or
  // the form unmounts (creating them during render leaked one per re-render).
  const previewUrls = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos]);
  useEffect(() => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)), [previewUrls]);
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [overallCondition, setOverallCondition] = useState<
    "excellent" | "good" | "fair" | "poor"
  >("good");
  const [checklist, setChecklist] = useState<ChecklistCategory[]>(
    () =>
      inspectionChecklistTemplate.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
          ...item,
          completed: false,
          notes: "",
        })),
      })),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notes = [summary, recommendations].filter(Boolean).join("\n\n").trim();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const photoKeys = await uploadPhotos(photos);

      // { [category]: { [item label]: { completed, notes } } }
      const roomChecklist = Object.fromEntries(
        checklist.map((cat) => [
          cat.category,
          Object.fromEntries(
            cat.items.map((item) => [item.label, { completed: !!item.completed, notes: item.notes || undefined }]),
          ),
        ]),
      );

      await submitReport(jobId, {
        overallGrade: CONDITION_MAP[overallCondition],
        roomChecklist,
        photoKeys,
        notes,
      });

      onSubmitted?.();
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error("Failed to submit report"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    const requiredItemsCompleted = checklist.every((cat) =>
      cat.items.every((item) => !item.required || item.completed)
    );
    return requiredItemsCompleted && notes.length >= MIN_NOTES_LENGTH && photos.length >= MIN_PHOTOS;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Info */}
      <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <h3 className="text-lg font-bold text-foreground">Property Information</h3>
        <p className="mt-1 text-muted-foreground">{propertyTitle}</p>
        <p className="text-sm text-muted-foreground">Job ID: {jobId}</p>
      </Card>

      {/* Checklist */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-foreground">
          Inspection Checklist
        </h3>
        <InspectionChecklist value={checklist} onChange={setChecklist} />
      </div>

      {/* Photo Upload */}
      <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <h3 className="mb-4 text-lg font-bold text-foreground">Photo Evidence</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="photos" className="mb-2 block">
              Upload inspection photos (required)
            </Label>
            <Input
              id="photos"
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="border-2 border-foreground"
            />
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg border-2 border-foreground bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview, nothing for next/image to optimise */}
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length === 0 && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground bg-muted p-8">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No photos uploaded yet
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary */}
      <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <h3 className="mb-4 text-lg font-bold text-foreground">
          Inspection Summary
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="summary" className="mb-2 block">
              Summary of findings (required)
            </Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide a detailed summary of your inspection findings..."
              className="border-2 border-foreground"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="recommendations" className="mb-2 block">
              Recommendations (optional)
            </Label>
            <Textarea
              id="recommendations"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Any recommendations for the landlord or property manager..."
              className="border-2 border-foreground"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="condition" className="mb-2 block">
              Overall Condition (required)
            </Label>
            <select
              id="condition"
              value={overallCondition}
              onChange={(e) =>
                setOverallCondition(
                  e.target.value as "excellent" | "good" | "fair" | "poor"
                )
              }
              className="w-full border-2 border-foreground bg-background p-2"
              required
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        {!canSubmit() && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>
              Complete all required checklist items, add at least {MIN_PHOTOS} photos,
              and write at least {MIN_NOTES_LENGTH} characters of notes to submit
            </span>
          </div>
        )}
        <Button
          type="submit"
          disabled={!canSubmit() || isSubmitting}
          className="ml-auto border-3 border-foreground bg-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit Inspection Report
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
