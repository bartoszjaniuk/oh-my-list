import { z } from "zod";

export const createListFormSchema = z.object({
	name: z.string().trim().min(1, "Podaj nazwę listy"),
	type: z.enum(["shopping", "other"], {
		error: "Wybierz typ listy",
	}),
});

export type CreateListFormValues = z.infer<typeof createListFormSchema>;
export type CreateListFormInput = z.input<typeof createListFormSchema>;
