import { type AuthUser } from "wasp/auth";
import { CreateTaskForm } from "./components/CreateTaskForm";
import { TaskList } from "./components/TaskList";

export const TasksPage = ({ user }: { user: AuthUser }) => {
  return (
    <div className="flex flex-col items-center gap-5 px-8 py-8">
      <h1 className="heading-display text-5xl tracking-tight">{user.username}<span className="text-neutral-400">'s tasks</span></h1>
      <div className="flex w-full flex-col items-center gap-6">
        <section className="card flex w-full max-w-3xl flex-col gap-6 p-4 lg:p-6">
          <CreateTaskForm />
        </section>
        <section className="card flex w-full max-w-3xl flex-col gap-6 px-4 py-3 lg:px-6 lg:py-4">
          <TaskList />
        </section>
      </div>
    </div>
  );
};
