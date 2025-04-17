import React, {useRef, useEffect} from "react" 
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import AutoPlay from "embla-carousel-autoplay"


export default function About() {
  
  const autoplay = useRef(AutoPlay({delay: 2000}))
  
  const images = [
    { src: "/images/Yan.jpeg", alt: "Me" },
    { src: "/placeholder.svg?height=400&width=600", alt: "Image 2" },
    { src: "/placeholder.svg?height=400&width=600", alt: "Image 3" },
    { src: "/placeholder.svg?height=400&width=600", alt: "Image 4" },
    { src: "/placeholder.svg?height=400&width=600", alt: "Image 5" },
  ]

  return (
    <div className = "flex flex-row items-center justify-center gap-8 mt-20">
      <div className = "flex flex-col items-start w-3/5 max-w-3xl gap-4"> 
        <h1 className = "text-4xl font-bold text-left text-white">
          About Me
        </h1> 
        <p className = "text-sm text-white font-size"> 
        Hey! I'm Yan, a passionate software developer and AI enthusiast studying Computer Engineering at The University of Waterloo. I'm originally from Vancouver, BC, but I'll be studying abroad at Waterloo, ON for the next few years. I'm always excited to improve my skills and explore new experiences.
        <br></br>
        <br></br>
        Beyond coding, I love guitar, chess, soccer, table tennis, frisbee, and traveling.
        </p> 
      </div>
      <div className = "w-2/5 max-w-3xl"> 
        <Carousel className="w-2/5 max-w-3xl" plugins={[autoplay.current]}>
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
              <CarouselPrevious className="relative text-white"/>
              <CarouselNext className="relative text-white" />
            </div>
          </div>
        </Carousel>
      </div>
      
    </div>
  )
}

