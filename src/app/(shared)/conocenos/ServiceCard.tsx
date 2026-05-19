import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface ServiceCardProps {
  imageSrc: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  target?: string;
  rel?: string;
  download?: string | boolean;
}

export function ServiceCard({
  imageSrc,
  title,
  description,
  buttonText,
  href,
  target,
  rel,
  download,
}: ServiceCardProps) {
  return (
    <Card className="flex flex-col h-auto overflow-hidden hover:shadow-lg transition-shadow duration-300 border-slate-200 rounded-2xl mx-auto w-full max-w-[340px]">
      <div className="relative w-full h-44 bg-white p-3 pb-2">
        <div className="relative w-full h-full rounded-xl overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      <CardContent className="px-3 py-1 flex flex-col items-center text-center">
        <hr className="w-full border-t border-slate-200 mb-1" />
        <p className="text-[12px] text-slate-500 leading-tight max-w-[280px] line-clamp-2">
          {description}
        </p>
      </CardContent>

      <CardFooter className="px-3 pb-3 pt-0 mt-auto">
        <Button
          asChild
          className="w-full bg-color-boton-2 hover:bg-color-boton-2-hover text-white rounded-lg h-8 font-medium text-xs"
        >
          <Link href={href} target={target} rel={rel} download={download}>
            {buttonText}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
