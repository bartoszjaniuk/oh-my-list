import { useCreateListMutation } from "@/api/lists/hooks/useCreateListMutation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import {
	createListFormSchema,
	type CreateListFormInput,
	type CreateListFormValues,
} from "../createList.schema";

type UseCreateListOptions = {
	onCreated: () => void;
};

export function useCreateList({ onCreated }: UseCreateListOptions) {
	const [createError, setCreateError] = useState<string | null>(null);
	const { mutateAsync, isPending: isCreating } = useCreateListMutation();

	const form = useForm<CreateListFormInput, unknown, CreateListFormValues>({
		resolver: zodResolver(createListFormSchema),
		defaultValues: {
			name: "",
			type: undefined,
		},
		mode: "onChange",
	});

	const { control, handleSubmit, formState, reset } = form;
	const { isValid } = formState;

	const clearCreateError = useCallback(() => {
		setCreateError(null);
	}, []);

	const resetForm = useCallback(() => {
		reset({ name: "", type: undefined });
		setCreateError(null);
	}, [reset]);

	const createList = useCallback(
		async (values: CreateListFormValues) => {
			setCreateError(null);
			try {
				await mutateAsync({ name: values.name, type: values.type });
				resetForm();
				onCreated();
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: "Nie udało się utworzyć listy.";
				setCreateError(message);
			}
		},
		[mutateAsync, onCreated, resetForm],
	);

	const onSubmit = handleSubmit(createList);
	const canSubmit = isValid && !isCreating;

	return {
		control,
		canSubmit,
		createError,
		isCreating,
		onSubmit,
		clearCreateError,
		resetForm,
	};
}

export type CreateListModel = ReturnType<typeof useCreateList>;
