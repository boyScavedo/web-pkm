import { redirect } from "next/navigation";

export default function AppHome() {
  redirect("/notes");
}