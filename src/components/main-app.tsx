import { Header } from "@/components/header";
import { Feed } from "@/components/feed";
import { UploadForm } from "@/components/upload-form";

export function MainApp() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto max-w-3xl flex-grow p-4 md:p-6">
        <div className="grid gap-8">
          <UploadForm />
          <Feed />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SocialVerse. All rights reserved.
      </footer>
    </div>
  );
}
