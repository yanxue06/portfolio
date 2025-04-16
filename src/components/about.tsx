import * as React from "react";
import "../styles/home.css";
import "../styles/timeline.css";
import "../styles/arrow.scss";
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Yan from "/images/Yan.jpeg";

import "../styles/navbar.css";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="about" style={{ width: "100%" }}>
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        style={{ width: "100%" }}
      >
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center">
                       <img src={Yan} alt="Yan" className="w-full h-full object-cover" />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </motion.div>
    </section>
  );
}
