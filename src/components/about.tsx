import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AutoPlay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

export default function About() {
  type autoplay = {
    delay: number;
  };

  type images = {
    src: string;
    alt?: string;
  };

  const autoplay = useRef(AutoPlay({ delay: 2000 }));

  const images = [
    { src: "/images/Yan.jpeg", alt: "Me" },
    { src: "/images/gallery/g9.png", alt: "Me" },
    // { src: "/images/gallery/g17.png", alt: "Me" },
    // { src: "/images/gallery/g11.png", alt: "Me" },
    // { src: "/images/gallery/g12.png", alt: "Me" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-stretch lg:w-[1150px] md:flex-row flex-col mt-20"
      >
        <div className="flex flex-col items-start justify-center flex-1 w-full px-12 md:p-12 md:w-1/2">
          <h1 className="w-full p-2 text-3xl font-black text-white md:text-5xl">
            ABOUT ME
          </h1>
          <p className="w-full p-2 pb-4 text-sm font-light text-white md:text-base">
            Hey! I'm Yan, a passionate software developer and AI enthusiast
            studying Computer Engineering at The University of Waterloo. I'm
            originally from Vancouver, BC, but I'll be studying abroad at
            Waterloo, ON for the next few years. I'm always excited to improve
            my skills and explore new experiences.
            <br></br>
            <br></br>
            Beyond coding, I love guitar, chess, soccer, table tennis, frisbee,
            and traveling.
          </p>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full p-12 lg:p-12 md:w-1/2 lg:mb-0">
          <Carousel className="w-full" plugins={[autoplay.current]}>
            <div className="flex flex-col items-center justify-center gap-4">
              <div>
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <Card>
                        <CardContent className="flex items-center justify-center">
                          <div className="relative w-full overflow-hidden rounded-lg">
                            <img
                              src={image.src || "/placeholder.svg"}
                              alt={image.alt}
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </div>
              <div className="flex items-center justify-center">
                <CarouselPrevious className="relative text-white" />
                <CarouselNext className="relative text-white" />
              </div>
            </div>
          </Carousel>
        </div>
      </motion.div>
    </div>
  );
}
