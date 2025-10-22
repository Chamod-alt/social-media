import { AuthForm } from "@/components/auth-form";
import { Icons } from "@/components/icons";

export function AuthPage() {
  return (
    <div className="container relative grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary z-10" />
        <iframe src='https://my.spline.design/3dicon-53a53d5a28723337b5658652613e5b3f/' frameBorder='0' width='100%' height='100%' className="absolute inset-0 z-10"></iframe>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Icons.logo className="mr-2 h-8 w-8" />
          SocialVerse
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Connect, share, and discover. Your universe of stories
              awaits.&rdquo;
            </p>
            <footer className="text-sm">The SocialVerse Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
