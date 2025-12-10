import Image from "next/image";

export function Logo() {
  return (
    <div className="relative h-10 w-40">
      <Image
        src="/images/logo/logo.png"
        fill
        className="object-contain"
        alt="Logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}
