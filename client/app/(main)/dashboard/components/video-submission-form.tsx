"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormSchema, videoSchema, VideoSchema } from "@/lib/validations/video";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitVideo } from "@/lib/api/video";
import { toast } from "sonner";
import { error } from "console";


export default function VideoSubmissionForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const queryClient = useQueryClient()

    const form = useForm<VideoSchema>({
        resolver: zodResolver(videoSchema),
        defaultValues: { url: "" },
    });

    const { mutate } = useMutation({
        mutationFn: submitVideo,
        onSuccess: (data)=>{
            toast.success("Video submitted successfully", {
                description: data.videoInfo.title,
            })
            form.reset()
            queryClient.invalidateQueries({queryKey: ["jobs"]})
            queryClient.invalidateQueries({queryKey: ["videos"]})
        },
        onError: (error)=>{
            toast.error("Failed to submit video", {
                description: error.message
            })
        },
        onSettled:(error)=>{
            setIsSubmitting(false)
        }
        
    })

    const onSubmit = (data: FormSchema) => {
        setIsSubmitting(true)
        mutate(data)
    };

    return (
        <Card className="max-w-2xl p-6 shadow-lg transition-all hover:shadow-xl">
            <CardHeader>
                <CardTitle>Submit a video</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <Controller
                        name="url"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                    YouTube URL
                                </FieldLabel>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id={field.name}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="pl-10"
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                    />
                                </div>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full transition-all mt-4"
                        disabled={isSubmitting}
                    >
                        { isSubmitting ? "Submitting..." : "Submit Video" }
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}