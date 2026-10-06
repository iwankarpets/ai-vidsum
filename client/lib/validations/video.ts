import z from "zod";

export const videoSchema =  z.object({
    url: z
        .string()
        .url("Please enter a valid url")
        .refine(
            (url)=> url.includes("youtube.com") || url.includes("youtube.be"),
            "Please enter a valid Youtube URL"
        )
})

const formSchema = z.object({
    url: z.string().url("Введите корректный URL"),
});

export type FormSchema = z.infer<typeof formSchema>;
export type VideoSchema = z.infer<typeof videoSchema>