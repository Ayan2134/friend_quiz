import Link from "next/link";
import { CreateQuizForm } from "@/components/CreateQuizForm";

export const metadata = {
  title: "Create a quiz — KnowMe",
  description: "Build a quiz about yourself and challenge your friends.",
};

export default function CreatePage() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <Link href="/" className="brand-mark">
          KnowMe
        </Link>
      </header>
      <CreateQuizForm />
    </main>
  );
}
