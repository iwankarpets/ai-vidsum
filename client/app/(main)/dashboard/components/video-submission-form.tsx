"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const formSchema = z.object({
    url: z.string().url("Введите корректный URL"),
});

type FormSchema = z.infer<typeof formSchema>;

export default function VideoSubmissionForm() {
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: { url: "" },
    });

    const onSubmit = (data: FormSchema) => {
        console.log(data);
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
                        disabled={form.formState.isSubmitting}
                    >
                        Submit Video
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}