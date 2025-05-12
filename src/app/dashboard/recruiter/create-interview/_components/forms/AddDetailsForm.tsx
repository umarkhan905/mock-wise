import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { difficultyLevels, experienceIn, interviewTypes } from "@/constants";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import React, { useState } from "react";
import GenerateKeywords from "../buttons/GenerateKeywords";
import { KeywordsModal } from "../modals/KeywordsModal";
import FormError from "@/components/error/FormError";
import GenerateDescription from "../buttons/GenerateDescription";

interface Props {
  loading: boolean;
  formData: AddDetails;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<AddDetails>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function AddDetailsForm({
  loading,
  error,
  formData,
  onSubmit,
  setFormData,
  setError,
}: Props) {
  const [isOpenKeywordsModal, setIsOpenKeywordsModal] =
    useState<boolean>(false);

  const handleFormDataChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleArrayFormDataChange = (
    id: "type" | "keywords",
    value: string,
    action: "add" | "remove"
  ) => {
    if (action === "remove") {
      return setFormData((prev) => ({
        ...prev,
        [id]: prev[id].filter((item) => item !== value),
      }));
    }

    return setFormData((prev) => ({ ...prev, [id]: [...prev[id], value] }));
  };

  const isButtonDisabled = Object.values(formData).some(
    (value) => value === "" || value.length === 0
  );
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Interview Title</Label>
          <Input
            id="title"
            type="text"
            className="min-h-10 bg-muted"
            placeholder="e.g. Full Stack Developer Interview"
            value={formData.title}
            onChange={handleFormDataChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            type="text"
            className="min-h-10 bg-muted"
            placeholder="e.g. Full Stack Developer"
            value={formData.role}
            onChange={handleFormDataChange}
          />
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            className="min-h-30 resize-none bg-muted"
            placeholder="Describe the purpose and scope of the interview..."
            value={formData.description}
            onChange={handleFormDataChange}
          />

          <GenerateDescription
            formData={formData}
            setFormData={setFormData}
            setError={setError}
            className="absolute right-2 top-8"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <div className="flex flex-wrap gap-2 items-center">
            {interviewTypes.map((type) => (
              <Button
                type="button"
                key={type.state}
                variant={"outline"}
                className={`rounded-full  ${formData.type.includes(type.state) ? "bg-primary/20 hover:bg-primary/20 hover:text-white" : "hover:bg-background hover:text-foreground"}`}
                size={"lg"}
                onClick={() =>
                  formData.type.includes(type.state)
                    ? handleArrayFormDataChange("type", type.state, "remove")
                    : handleArrayFormDataChange("type", type.state, "add")
                }
              >
                <type.icon />
                <span>{type.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <div id="difficulty" className="flex flex-wrap gap-2 items-center">
            {difficultyLevels.map((type) => (
              <Button
                type="button"
                key={type.state}
                variant={"outline"}
                className={`rounded-full  ${formData.difficulty === type.state ? "bg-primary/20 hover:bg-primary/20 hover:text-white" : "hover:bg-background hover:text-foreground"}`}
                size={"lg"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, difficulty: type.state }))
                }
              >
                <type.icon />
                <span>{type.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <div className="flex gap-1 p-2 rounded-lg border min-h-10 bg-muted items-center">
            {formData.keywords.length === 0 ? (
              <div className="flex-1">
                <span className="text-muted-foreground text-sm">
                  Add Interview Related Keywords
                </span>
              </div>
            ) : (
              <div className="flex-1 flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <div key={keyword} className="relative">
                    <Badge
                      variant={"outline"}
                      className="rounded-full min-w-20 py-1.5"
                    >
                      {keyword}

                      {/* delete */}
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 bg-primary/30 rounded-full p-0.5 z-10"
                        onClick={() =>
                          handleArrayFormDataChange(
                            "keywords",
                            keyword,
                            "remove"
                          )
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <GenerateKeywords
                formData={formData}
                setFormData={setFormData}
                setError={setError}
              />

              <Button
                type="button"
                variant={"outline"}
                className="rounded-full bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary"
                size={"icon"}
                onClick={() => setIsOpenKeywordsModal(true)}
              >
                <Plus className="size-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience</Label>
          <Input
            id="experience"
            type="number"
            className="min-h-10 bg-muted"
            placeholder="e.g. 2"
            value={formData.experience}
            onChange={handleFormDataChange}
            min={0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Experience In</Label>
          <div id="difficulty" className="flex flex-wrap gap-2 items-center">
            {experienceIn.map((type) => (
              <Button
                type="button"
                key={type.state}
                variant={"outline"}
                className={`rounded-full  ${formData.experienceIn === type.state ? "bg-primary/20 hover:bg-primary/20 hover:text-white" : "hover:bg-background hover:text-foreground"}`}
                size={"lg"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, experienceIn: type.state }))
                }
              >
                <type.icon />
                <span>{type.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {error && <FormError message={error} />}

        <div className="flex justify-end">
          <Button
            type="submit"
            className="min-h-10 text-white min-w-22"
            disabled={isButtonDisabled}
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="size-5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Keywords Modal */}
      <KeywordsModal
        open={isOpenKeywordsModal}
        setOpen={setIsOpenKeywordsModal}
        addKeyword={handleArrayFormDataChange}
      />
    </>
  );
}
