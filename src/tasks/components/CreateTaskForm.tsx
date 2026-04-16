import { useCallback } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { twJoin } from "tailwind-merge";
import { createTask, getTags, useQuery } from "wasp/client/operations";
import { emitTaskSubmitting, emitTaskSaved, waitForDrawerProceed } from "../../guide-bubble/taskEvents";
import { Tag } from "wasp/entities";
import { Button } from "../../shared/components/Button";
import { CreateTagDialog } from "../../tags/components/CreateTagDialog";
import { TagLabel } from "../../tags/components/TagLabel";

interface CreateTaskFormValues {
  description: string;
  tagIds: string[];
}

export function CreateTaskForm() {
  const { data: tags } = useQuery(getTags);
  const { handleSubmit, getValues, setValue, watch, control, reset, formState } =
    useForm<CreateTaskFormValues>({
      defaultValues: {
        description: "",
        tagIds: [],
      },
    });

  const onSubmit: SubmitHandler<CreateTaskFormValues> = async (data, event) => {
    event?.stopPropagation();

    emitTaskSubmitting(data.description);
    try {
      // Pauses here if the data-flow drawer is open — resumes when user reaches step 3→4
      await waitForDrawerProceed();
      const task = await createTask(data);
      emitTaskSaved(task.id, data.description);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "cancelled") return;
      window.alert(`Error while creating task: ${String(err)}`);
    } finally {
      reset();
    }
  };

  const toggleTag = useCallback(
    function toggleTag(id: Tag["id"]) {
      const tagIds = getValues("tagIds");
      if (tagIds.includes(id)) {
        setValue("tagIds", tagIds.filter((tagId) => tagId !== id));
      } else {
        setValue("tagIds", [...tagIds, id]);
      }
    },
    [getValues, setValue],
  );

  const tagIds = watch("tagIds");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-4"
      id="create-task"
    >
      <h2 className="heading-display text-2xl">Create a new task</h2>

      {/* Description input with inline Add Tag button */}
      <div className="flex flex-col gap-1">
        <div className={twJoin(
          "flex items-center overflow-hidden rounded-sm border bg-white",
          formState.errors.description
            ? "border-red-500"
            : "border-neutral-300 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500",
        )}>
          <Controller
            name="description"
            control={control}
            rules={{ required: { value: true, message: "Description is required" } }}
            render={({ field }) => (
              <input
                placeholder="What do I need to do?"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-neutral-800 outline-none"
                {...field}
              />
            )}
          />
          <div className="shrink-0 border-l border-neutral-200 px-2 py-1">
            <CreateTagDialog />
          </div>
        </div>
        {formState.errors.description && (
          <span className="text-sm text-red-500">{formState.errors.description.message}</span>
        )}
      </div>

      {/* Tag toggles — flat pills, only shown when tags exist */}
      {tags && tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag.id}>
              <button type="button" onClick={() => toggleTag(tag.id)}>
                <TagLabel tag={tag} isActive={tagIds.includes(tag.id)} showColorCircle />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button type="submit" className="self-end flex items-center gap-2" disabled={formState.isSubmitting}>
        {formState.isSubmitting && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {formState.isSubmitting ? "Adding…" : "Create"}
      </Button>
    </form>
  );
}
