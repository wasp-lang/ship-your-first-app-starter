import { Outlet } from "react-router";
import "./App.css";
import { Header } from "./shared/components/Header";
import { GuideBubble } from "./guide-bubble/GuideBubble";

export function App() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-neutral-50 text-neutral-800">
      <Header />
      <Outlet />
      <GuideBubble />
    </main>
  );
}
