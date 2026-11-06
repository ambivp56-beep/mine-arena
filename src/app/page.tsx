import Logo from "@/components/Logo";
import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-12 text-center">
        <Logo />
        <h1 className="mt-10 font-pixel text-base sm:text-xl leading-relaxed text-gold" style={{ textShadow: "3px 3px 0 #000" }}>
          PARTICIPANT MEDICAL FORM
        </h1>
        <p className="mt-4 text-stone max-w-xl mx-auto">Every player in the arena fills this once. It takes about two minutes and helps our team respond fast if you need help.</p>
      </header>
      <RegistrationForm />
      <footer className="mt-16 text-center text-xs text-stone/70">Mine Arena 1.0 · 24 Hours National Level Hackathon</footer>
    </main>
  );
}
