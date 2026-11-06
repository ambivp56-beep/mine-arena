import Image from "next/image";

export default function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="mx-auto bg-white" style={{ boxShadow: "0 0 0 4px #000, 0 0 0 8px #5db136, 0 0 0 12px #000", maxWidth: small ? 260 : 560 }}>
      <Image src="/logo.jpeg" alt="Mine Arena 1.0 – 24 Hours Hackathon" width={1600} height={642} priority className="logo-drop w-full h-auto" />
    </div>
  );
}
